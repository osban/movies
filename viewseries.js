import m from "mithril"
import Model from "./model"

const ViewSeries = {
  onbeforeupdate: () => {
    if (Model.showeps > -1)
      Model.geteps(Model.current.imdbid + "&Season=" + Number(Model.showeps + 1))
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
            Model.current.seasonsowned.map((season, i) => [
              m('tr',
                m('td',
                  m('a', {
                    style: "cursor: pointer",
                    onclick: () => Model.showeps = i
                  }, "Season " + (i+1))
                ),
                m('td',
                  m('span', season
                    ? m('img', {src: 'images/checkmark-16.png'})
                    : m('img.xmark', {src: 'images/xmark-16.png'}))
                ),
                m('td',
                  m('span', Model.current.seasonsseen[i]
                    ? m('img', {src: 'images/checkmark-16.png'})
                    : m('img.xmark', {src: 'images/xmark-16.png'}))
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
            Model.showeps > -1 && m('th', "Season " + (Model.showeps + 1))
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
