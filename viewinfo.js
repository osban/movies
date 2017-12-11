import m from "mithril"
import Model from "./model"
import ViewSeries from "./viewseries"

const ViewInfo = {
  mm2hm: minraw => {
    const min = Number(minraw)
    let time = ""
    if (min !== 0) {
      const hh = min / 60 | 0
      let mm = min % 60
      if (mm < 10) mm = "0" + mm
      time = `${hh}:${mm}`
    }
    else time = ""

    return time
  },

  view: () => [
    m('div',
      m('div.row.mtxx',
        m('div.eight columns',
          m('h3', `${Model.current.title} ${Model.year}`),
          m('p',
            m('label', "plot:"),
            m('span', Model.current.plot)
          ),
          m('p',
            m('b', "director: "),
            m('span', Model.current.director)
          ),
          m('p',
            m('b', "writer: "),
            m('span', Model.current.writer),
            m('br'),
            m('b', "cast: "),
            m('span', Model.current.cast)
          ),
          m('div.row',
            m('div.one-half column',
              m('p',
                m('b', "country: "),
                m('span', Model.current.country),
                m('br'),
                m('b', "languages: "),
                m('span', Model.current.languages),
                m('br'),
                m('b', "original title: "),
                m('span', Model.current.originaltitle),
                m('br'),
                m('b', "runtime: "),
                m('span', ViewInfo.mm2hm(Model.current.runtime)),
                m('br'),
                m('b', "genres: "),
                m('span', Model.current.genres),
                m('br'),
                m('b', "type: "),
                m('span', Model.current.type)
              )
            ),
            m('div.one-half column',
              m('p',
                m('div.viewratdisk',
                  m('b', "rating: "),
                  m('span', Model.current.rating)
                ),
                m('b', "metascore: "),
                m('span', Model.current.metascore),
                m('br'),
                m('b', "imdb: "),
                m('a', {href: Model.current.imdburl, target: "_blank"}, Model.current.imdburl),
                m('br'),
                m('div.viewratdisk',
                  m('b', "disk: "),
                  m('span', Model.current.disk)
                ),
                m('b', "seen: "),
                Model.current.seen ? m('img', {src: 'images/checkmark-16.png'}) : m('img.xmark', {src: 'images/xmark-16.png'}),
                m('br'),
                m('b', "notes: "),
                m('span', Model.current.notes)
              )
            )
          )
        ),
        m('div.four columns.widthccc',
          m('img', {src: Model.current.poster})
        )
      ),
      m('div.row', Model.current.seasons > 0 && m(ViewSeries))
    )
  ]
}
export default ViewInfo
