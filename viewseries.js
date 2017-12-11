import m from "mithril"
import Model from "./model"

const ViewSeries = {
  onbeforeupdate: () => {
    if (Model.showeps > -1) Model.geteps(Model.current.imdbid + "&Season=" + Number(Model.showeps + 1))
  },

  view: () => [
    m('div',
      m('div.three columns',
        m('table',
          m('thead',
            m('th'),
            m('th', "O"),
            m('th', "S")
          ),
          m('tbody',
            Model.current.seasonsowned.map((item, i) => [
              m('tr',
                m('td',
                  m('a', {onclick: () => Model.showeps = i}, "Season " + Number(i+1))
                ),
                m('td',
                  m('span', item ? m('img', {src: 'checkmark-16.png'}) : m('img.xmark', {src: 'xmark-16.png'}))
                ),
                m('td',
                  m('span', Model.current.seasonsseen[i] ? m('img', {src: 'checkmark-16.png'}) : m('img.xmark', {src: 'xmark-16.png'}))
                )
              )
            ])
          )
        )
      ),
      m('div.five columns',
        m('table',
          m('thead',
            m('th'),
            Model.showeps > -1 && m('th', "Season " + Number(Model.showeps + 1))
          ),
          m('tbody',
            Model.showeps > -1 && Model.cureps.Episodes.map(item => [
              m('tr',
                m('td', item.Episode + "."),
                m('td',
                  m('a', {href: "https://www.imdb.com/title/" + item.imdbID, target: "_blank"}, item.Title)
                )
              )
            ])
          )
        )
      )
    )
  ]
}
export default ViewSeries
