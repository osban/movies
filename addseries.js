import m from "mithril"
import Movie from "./model"

const addseries = {
  initseasons() {
    Movie.postdata.seasonsowned = Array(Number(Movie.current.totalSeasons)).fill(false)
    Movie.postdata.seasonsseen = Array(Number(Movie.current.totalSeasons)).fill(false)
    Movie.postdata.seasons = Number(Movie.current.totalSeasons)
  },

  oninit() {
    addseries.initseasons()
    Movie.initseasons = false
  },

  onbeforeupdate() {
    Movie.initseasons ? (addseries.initseasons(), Movie.initseasons = false) : null
  },

  view() {
    return m('div',
      m('b', "owned:"),
      m('br'),
      Movie.postdata.seasonsowned.map((item, season) => {
        season++
        return m('span',
          m('input[type=checkbox]', {
            name: season,
            onchange: function() {Movie.checkseasonsowned(this.checked, this.name)}}
          ),
          m('b.season.labeltop', "Season " + season)
        )
      }),
      m('br'),
      m('b', "seen:"),
      m('br'),
      Movie.postdata.seasonsseen.map((item, season) => {
        season++
        return m('span',
          m('input[type=checkbox]', {
            name: season,
            onchange: function() {Movie.checkseasonsseen(this.checked, this.name)}}
          ),
          m('b.season.labeltop', "Season " + season)
        )
      })
    )
  }
}

module.exports = addseries
