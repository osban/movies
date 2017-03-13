import m from "mithril"
import Movie from "./model"

const addlist = {
  view() {
    return m('div',
      m('div.row.mtxx',
        m('h3', "Search Results: " + Movie.current.totalResults),
        m('ol',
          Movie.current.Search.map(item => {
            return m('li',
              m('a', {href: "javascript:void(0)", onclick: () => Movie.getqueryid(item.imdbID)}, item.Title),
              m('span', ` (${item.Year}) --`),
              m('span', ` ${item.Type} -- `),
              m('a', {href: "https://www.imdb.com/title/" + item.imdbID, target: "_blank"}, "imdb")
            )
          })
        )
      )
    )
  }
}

module.exports = addlist
