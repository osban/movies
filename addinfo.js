import m from "mithril"
import Model from "./model"
import AddSeries from "./addseries"

const AddInfo = {
  view: () => [
    m('div',
      m('div.row.mtxx',
        m('div.eight columns',
          m('h3', `${Model.current.Title} (${Model.current.Year})`),
          m('p',
            m('label', "plot:"),
            m('span', Model.current.Plot)
          ),
          m('p',
            m('b', "director: "),
            m('span', Model.current.Director)
          ),
          m('p',
            m('b', "writer: "),
            m('span', Model.current.Writer),
            m('br'),
            m('b', "cast: "),
            m('span', Model.current.Actors)
          ),
          m('div.row',
            m('div.one-half column',
              m('p',
                m('b', "country: "),
                m('span', Model.current.Country),
                m('br'),
                m('b', "languages: "),
                m('span', Model.current.Language),
                m('br'),
                m('b', "runtime: "),
                m('span', Model.current.Runtime),
                m('br'),
                m('b', "genres: "),
                m('span', Model.current.Genre),
                m('br'),
                m('b', "type: "),
                m('span', Model.current.Type)
              )
            ),
            m('div.one-half column',
              m('p',
                m('b', "rating: "),
                m('span', Model.current.imdbRating),
                m('b.mlxx', "metascore: "),
                m('span', Model.current.Metascore),
                m('br'),
                m('b', "imdb: "),
                m('a', {
                  href: "https://www.imdb.com/title/" + Model.current.imdbID, target: "_blank"
                }, "www.imdb.com/title/" + Model.current.imdbID),
                m('p'),
                m('b.labeltop', "notes: "),
                m('textarea.widthccc', {
                  onfocus: e => e.target.select(),
                  oninput: m.withAttr('value', Model.postdata.notes)}, Model.postdata.notes()
                )
              )
            )
          )
        ),
        m('div.four columns',
          m('img', {src: Model.current.Poster})
        )
      ),
      m('div.row',
        Model.current.totalSeasons && m(AddSeries),
        m('span',
          m('b', "disk: "),
          m('input.adddisk', {
            type: 'text',
            onfocus: e => e.target.select(),
            onchange: m.withAttr('value', Model.postdata.disk)}, Model.postdata.disk()
          ),
          m('b.mlxx', "original title: "),
          m('input.width280', {
            type: 'text',
            onfocus: e => e.target.select(),
            onchange: m.withAttr('value', Model.postdata.originaltitle)}, Model.postdata.originaltitle()
          ),
          m('b.mlxx.labeltop', "seen: "),
          m('input', {
            type: 'checkbox',
            onchange: m.withAttr('checked', Model.postdata.seen)}, Model.postdata.seen()
          ),
          m('button.button-primary.mlxxx', {onclick: () => Model.postmovie()}, "Add")
        )
      )
    )
  ]
}
export default AddInfo
