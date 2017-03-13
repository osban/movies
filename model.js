//model
import m from "mithril"
import s from "mithril/stream"

const Movie = {
  pointer: null,
  list: [],
  filterlist: [],

  filtertime: "< Time",
  filteryeargt: "> Year",
  filteryearlt: "< Year",
  filtertype: "Type",
  filtergenre: "Genre",
  genres: ["Action", "Adventure", "Animation", "Biography", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy",
    "Film-Noir", "History", "Horror", "Music", "Musical", "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "War", "Western"],
  filterdisk: "Disk",
  filterseen: "Seen",

  maxdisk: 0,
  disks: [],
  loadlist() {
    return m.request({
      method: "GET",
      url: "http://192.168.178.20:8089/getall"
    })
    .then(result => {
      Movie.list = result
      // sort on title
      let first = Movie.list[0]
      Movie.list.sort((a, b) => {
        return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 0
      })
      if (first === Movie.list[0]) list.reverse()
      // init filter list
      Movie.filterlist = Movie.list
      // find the max number of disks
      Movie.maxdisk = 0
      Movie.filterlist.map(item => {
        Number(item.disk) > Movie.maxdisk ? Movie.maxdisk = Number(item.disk) : null
        return Movie.maxdisk
      })
      // fill disks array
      for (let i=0; i < Movie.maxdisk+1; i++) {
        Movie.disks[i] = i
      }
    })
  },

  current: null,
  cureps: null,
  showeps: -1,
  year: "",
  error: "",
  state: "",
  geteps(id) {
    //let url = "http://192.168.178.20:8089/getqueryeps/" + id
    let url = "http://www.omdbapi.com/?i=" + id
    return m.request({
      method: "GET",
      url: url
    })
    .then(result => {
      Movie.cureps = result
    })
  },

  searching: "",
  getquery(name) {
    Movie.searching = "Searching..."
    Movie.error = ""
    // let url = "http://192.168.178.20:8089/getquery/" + name
    let url = "http://www.omdbapi.com/?s=" + name
    return m.request({
      method: "GET",
      url: url
    })
    .then(result => {
      Movie.current = result
      Movie.current.Response === "False" ? (Movie.error = Movie.current.Error, Movie.state = "error") : Movie.state = "found"
      Movie.searching = ""
      if (Movie.current.Response === "True") {
        if (Movie.current.totalResults !== "1") {
          Movie.state = "list"
        } else {
          Movie.getqueryid(Movie.current.Search[0].imdbID)
        }
      }
    })
  },

  initseasons: true,
  getqueryid(id) {
    Movie.searching = "Searching..."
    Movie.error = ""
    //let url = "http://192.168.178.20:8089/getqueryid/" + id
    let url = "http://www.omdbapi.com/?i=" + id
    return m.request({
      method: "GET",
      url: url
    })
    .then(result => {
      Movie.current = result
      Movie.current.Response === "False" ? (Movie.error = Movie.current.Error, Movie.state = "error") : Movie.state = "found"
      Movie.searching = ""
      Movie.initseasons = true
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
  checkseasonsowned(checked, name) {
    Movie.postdata.seasonsowned[Number(name) - 1] = checked
  },
  checkseasonsseen(checked, name) {
    Movie.postdata.seasonsseen[Number(name) - 1] = checked
  },
  postmovie() {
    Movie.current.Title ? Movie.postdata.title = Movie.current.Title : Movie.postdata.title = "Untitled"
    Movie.postdata.year = Movie.current.Year
    Movie.postdata.poster = Movie.current.Poster
    Movie.postdata.plot = Movie.current.Plot
    Movie.postdata.director = Movie.current.Director
    Movie.postdata.writer = Movie.current.Writer
    Movie.postdata.cast = Movie.current.Actors
    Movie.postdata.country = Movie.current.Country
    Movie.postdata.languages = Movie.current.Language
    Movie.postdata.runtime = Movie.current.Runtime.replace(/[^0-9]/g, "")
    Movie.postdata.genres = Movie.current.Genre
    Movie.postdata.type = Movie.current.Type
    Movie.postdata.rating = Movie.current.imdbRating
    Movie.postdata.metascore = Movie.current.Metascore
    Movie.postdata.imdbid = Movie.current.imdbID
    Movie.postdata.imdburl = "https://www.imdb.com/title/" + Movie.current.imdbID
    return m.request({
      method: "POST",
      url: "http://192.168.178.20:8089/post",
      data: Movie.postdata
    })
    .then(() => {
      Movie.postdata.seasons = 0
      Movie.initseasons = true
      Movie.postdata.originaltitle("")
      Movie.postdata.notes("")
      Movie.added = true
      Movie.state = ""
    })
  },

  updated: false,
  putmovie(id) {
    let url = "http://192.168.178.20:8089/put/" + id
    return m.request({
      method: "PUT",
      url: url,
      data: Movie.current
    })
    .then(() => {
      Movie.updated = true
    })
  },
  delmovie(id) {
    let url = "http://192.168.178.20:8089/delete/" + id
    return m.request({
      method: "DELETE",
      url: url,
      data: {id: id}
    })
    .then(() => {
      Movie.deleted = true
    })
  }
}

module.exports = Movie
