import m from "mithril"
import Model from "./model"
import EditSeries from "./editseries"

const EditInfo = {
  binds: data => {
    return {onchange: e => {
      if (e.target.name === "seen") Model.current.seen = !Model.current.seen
      else data[e.target.name] = e.target.value
    }}
  },

  oninit: ({state}) => {state.showdelok = false},

  onupdate: () => {
    Model.deleted = false
    Model.updated = false
  },

  view: ({state}) => [
    m('div', EditInfo.binds(Model.current),
      m('div.row.mtxx',
        m('div.seven columns',
          m('h3', `${Model.current.title} ${Model.year}`),
          m('p',
            m('label.editlabel', "edit title: "),
            m('input.edittitle', {
              type: 'text',
              name: 'title',
              onfocus: e => e.target.select(),
              value: Model.current.title
            }),
            m('br'),
            m('label.editlabel', "original title: "),
            m('input.edittitle', {
              type: 'text',
              name: 'originaltitle',
              onfocus: e => e.target.select(),
              value: Model.current.originaltitle
            }),
            m('br'),
            m('label.editlabel', "type: "),
            m('input.edittype[type=text][name=type]', {
              type: 'text',
              name: 'type',
              value: Model.current.type
            }),
            m('br'),
            m('label.editlabel', "rating: "),
            m('input.editratmet', {
              type: 'text',
              name: 'rating',
              value: Model.current.rating
            }),
            m('br'),
            m('label.editlabel', "metascore: "),
            m('input.editratmet', {
              type: 'text',
              name: 'metascore',
              value: Model.current.metascore
            }),
            m('br'),
            m('label.editlabel', "imdb: "),
            m('a', {href: Model.current.imdburl, target: "_blank"}, Model.current.imdburl),
            m('br'),
            m('label.editlabel', "disk: "),
            m('input.editdisk', {
              type: 'text',
              name: 'disk',
              onfocus: e => e.target.select(),
              value: Model.current.disk
            }),
            m('br'),
            m('label.editlabel.labeltop', "seen: "),
            m('input', {
              type: 'checkbox',
              name: 'seen',
              checked: Model.current.seen,
              value: Model.current.seen
            }),
            m('br'),
            m('label.editlabel', "notes: ",
              m('textarea.widthccc', {
                name: 'notes',
                onfocus: e => e.target.select(),
                value: Model.current.notes
              })
            )
          )
        ),
        m('div.five columns.widthccc',
          m('img', {src: Model.current.poster})
        )
      ),
      m('div.row',
        m('label.editlabel', "img url: "),
        m('input.editimgurl', {
          type: 'text',
          name: 'poster',
          onfocus: e => e.target.select(),
          value: Model.current.poster
        })
      ),
      m('div.row',
        Model.current.type === "series" && m(EditSeries),
        m('div',
          m('button.button-primary.mrxx', {onclick: () => Model.putmovie(Model.current._id)}, "Update"),
          m('button.button-primary#btndel', {onclick: () => state.showdelok = true}, "Delete")
        )
      ),
      state.showdelok &&
      m('div#delok',
        m('span#delok0', `Delete confirmation`),
        m('span#delok1', `Are you sure you want to delete`),
        m('br'),
        m('span', ">> "),
        m('span#delok2', Model.current.title),
        m('span', " << ?"),
        m('br'),
        m('button#delokok.mrx', {
          onclick: () => {
            state.showdelok = false
            Model.delmovie(Model.current._id)}
        }, "YES"),
        m('button#delokno.mlx', {
          onclick: () => state.showdelok = false
        }, "NO")
      )
    )
  ]
}
export default EditInfo
