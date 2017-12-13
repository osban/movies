//model
import m from "mithril"
import s from "mithril/stream"

const Model = {
  omdbapi: "",
  pointer: null,
  list: [],
  filterlist: [],

  filtertime: "< Time",
  filteryeargt: "> Year",
  filteryearlt: "< Year",
  filtertype: "Type",
  filtergenre: "Genre",
  filterdisk: "Disk",
  filterseen: "Seen",

  times: ["< Time", "1:30", "1:45", "2:00", "2:15", "2:30", "3:00", "5:00"],
  yearsgt: ["> Year", "1920", "1930", "1940", "1950", "1960", "1970", "1980", "1990", "2000", "2010", "2015"],
  yearslt: ["< Year", "1920", "1930", "1940", "1950", "1960", "1970", "1980", "1990", "2000", "2010", "2015"],
  types: ["Type", "movie", "series"],
  genres: ["Genre", "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy",
    "Film-Noir", "History", "Horror", "Music", "Musical", "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western"],
  seens: ["Seen", "Yes", "No"],

  maxdisk: 0,
  disks: [],
  loadlist: () => {
    m.request({
      method: "GET",
      url: "/getall"
    })
    .then(result => {
      Model.list = result.list
      Model.omdbapi = result.omdbapi
      // sort on title
      Model.list.sort((a, b) => {
        return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 0
      })
      // init filter list
      Model.filterlist = Model.list
      // find the max number of disks
      Model.maxdisk = 0
      Model.filterlist.map(item => {
        if (Number(item.disk) > Model.maxdisk) Model.maxdisk = Number(item.disk)
        return Model.maxdisk
      })
      // fill disks array
      Model.disks[0] = "Disk"
      for (let i=0; i < Model.maxdisk+1; i++) Model.disks[i+1] = i
    })
  },

  current: null,
  cureps: null,
  showeps: -1,
  year: "",
  error: "",
  state: "",
  geteps: id => {
    m.request({
      method: "GET",
      url: "http://www.omdbapi.com/?i=" + id + "&apikey=" + Model.omdbapi
    })
    .then(result => Model.cureps = result)
  },

  searching: false,
  getquery: name => {
    Model.searching = true
    Model.error = ""
    m.request({
      method: "GET",
      url: "http://www.omdbapi.com/?s=" + name + "&apikey=" + Model.omdbapi
    })
    .then(result => {
      Model.current = result
      Model.current.Response === "False" ? (Model.error = Model.current.Error, Model.state = "error") : Model.state = "found"
      Model.searching = false
      if (Model.current.Response === "True") {
        if (Model.current.totalResults !== "1") Model.state = "list"
        else Model.getqueryid(Model.current.Search[0].imdbID)
      }
    })
  },

  initseasons: true,
  getqueryid: id => {
    Model.searching = "Searching..."
    Model.error = ""
    m.request({
      method: "GET",
      url: "http://www.omdbapi.com/?i=" + id + "&apikey=" + Model.omdbapi
    })
    .then(result => {
      Model.current = result
      Model.current.Response === "False" ? (Model.error = Model.current.Error, Model.state = "error") : Model.state = "found"
      Model.searching = ""
      Model.initseasons = true
    })
  },

  added: false,
  postdata: {
    title: "",
    year: "",
    poster: "",
    plot: "",
    director: "",
    writer: "",
    cast: "",
    country: "",
    languages: "",
    runtime: "",
    genres: "",
    type: "",
    rating: "",
    metascore: "",
    imdbid: "",
    imdburl: "",
    disk: s(""),
    originaltitle: s(""),
    seen: s(false),
    seasons: 0,
    seasonsowned: [],
    seasonsseen: [],
    notes: s("")
  },

  checkseasonsowned: (checked, name) => Model.postdata.seasonsowned[Number(name)-1] = checked,
  checkseasonsseen: (checked, name) => Model.postdata.seasonsseen[Number(name)-1] = checked,

  postmovie: () => {
    Model.current.Title ? Model.postdata.title = Model.current.Title : Model.postdata.title = "Untitled"
    Model.postdata.year = Model.current.Year
    Model.postdata.poster = Model.current.Poster
    Model.postdata.plot = Model.current.Plot
    Model.postdata.director = Model.current.Director
    Model.postdata.writer = Model.current.Writer
    Model.postdata.cast = Model.current.Actors
    Model.postdata.country = Model.current.Country
    Model.postdata.languages = Model.current.Language
    Model.postdata.runtime = Model.current.Runtime.replace(/[^0-9]/g, "")
    Model.postdata.genres = Model.current.Genre
    Model.postdata.type = Model.current.Type
    Model.postdata.rating = Model.current.imdbRating
    Model.postdata.metascore = Model.current.Metascore
    Model.postdata.imdbid = Model.current.imdbID
    Model.postdata.imdburl = "https://www.imdb.com/title/" + Model.current.imdbID
    m.request({
      method: "POST",
      url: "/post",
      data: Model.postdata
    })
    .then(() => {
      Model.postdata.seasons = 0
      Model.initseasons = true
      Model.postdata.originaltitle("")
      Model.postdata.notes("")
      Model.added = true
      Model.state = ""
    })
  },

  updated: false,
  putmovie: id => {
    m.request({
      method: "PUT",
      url: "/put/" + id,
      data: Model.current
    })
    .then(() => Model.updated = true)
  },

  delmovie: id => {
    m.request({
      method: "DELETE",
      url: "/delete/" + id
    })
    .then(() => Model.deleted = true)
  }
}

export default Model
