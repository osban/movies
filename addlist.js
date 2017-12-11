import m from "mithril"
import Model from "./model"

const AddList = {
  view: () => [
    m('div',
      m('div.row.mtxx',
        m('h3', "Search Results: " + Model.current.totalResults),
        m('ol',
          Model.current.Search.map(item => [
            m('li',
              m('a', {
                style: "cursor: pointer",
                onclick: () => Model.getqueryid(item.imdbID)
              }, item.Title),
              m('span', ` (${item.Year}) --`),
              m('span', ` ${item.Type} -- `),
              m('a', {href: "https://www.imdb.com/title/" + item.imdbID, target: "_blank"}, "imdb")
            )
          ])
        )
      )
    )
  ]
}

export default AddList
