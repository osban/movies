import m from "mithril"
import Movie from "./model"

const editseries = {
  view() {
    return m('div',
      m('b', "owned:"),
      m('br'),
      Movie.current.seasonsowned.map((item, i) => {
        let season = i+1
        return m('span',
          m('input[type=checkbox]', {
            name: season,
            checked: Movie.current.seasonsowned[i],
            onchange: () => {Movie.current.seasonsowned[i] = !Movie.current.seasonsowned[i]}}
          ),
          m('b.season.labeltop', "Season " + season)
        )
      }),
      m('br'),
      m('b', "seen:"),
      m('br'),
      Movie.current.seasonsseen.map((item, i) => {
        let season = i+1
        return m('span',
          m('input[type=checkbox]', {
            name: season,
            checked: Movie.current.seasonsseen[i],
            onchange: () => {Movie.current.seasonsseen[i] = !Movie.current.seasonsseen[i]}}
          ),
          m('b.season.labeltop', "Season " + season)
        )
      }),
      m('br'),
      m('button#add', {
        onclick: () => {Movie.current.seasonsowned.push(false); Movie.current.seasonsseen.push(false); Movie.current.seasons++}},
        "Add season"
      ),
      m('button', {
        onclick: () => {Movie.current.seasonsowned.pop(); Movie.current.seasonsseen.pop(); Movie.current.seasons--}},
        "Remove season"
      )
    )
  }
}

module.exports = editseries
