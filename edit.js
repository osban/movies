import m from "mithril"
import s from "mithril/stream"
import Model from "./model"
import EditInfo from "./editinfo"

const Edit = {
  find: zoek => {
    const found = Model.list.find((item, i) => {
      if (item.title.toLowerCase().indexOf(zoek.toLowerCase()) > -1) Model.pointer = i
      return item.title.toLowerCase().indexOf(zoek.toLowerCase()) > -1
    })
    if (found) Model.current = found
  },

  oninit: ({state, attrs}) => {
    // If reload, go to list page
    if (!Model.list.length) m.route.set("/")
    state.zoekterm = s("")
    // find specific movie or load first one
    if (attrs.id === "0") Model.current = Model.list[0]
    else {
      Model.current = Model.list.find((item, i) => {
        if (item._id === attrs.id) Model.pointer = i
        return item._id === attrs.id
      })
    }
    Model.list[0] && Model.current.year ? Model.year = "(" + Model.current.year + ")" : Model.year = ""
    Model.updated = false
    Model.deleted = false
  },

  onbeforeupdate: () => {
    Model.current.year ? Model.year = "(" + Model.current.year + ")" : Model.year = ""
  },

  view: ({state}) => [
    m('div',
      m('div.row',
        m('div.twelve columns',
          m('input.zoek', {
            type: 'text',
            placeholder: "find by name",
            onfocus: e => {Model.updated = false; Model.deleted = false},
            oninput: m.withAttr('value', state.zoekterm),
            onkeypress: e => {
              if (e.keyCode === 13 && state.zoekterm() !== "") {
                Edit.find(state.zoekterm())
                e.target.blur()
              }
            },
            onchange: () => {if (state.zoekterm() !== "") Edit.find(state.zoekterm())}
          }),
          Model.pointer > 0
          ? m('button.btnprev', {
              onclick: () => {
                Model.current = Model.list[Model.pointer - 1]
                Model.pointer--}
            }, "PREV")
          : m('button.btninvisp[disabled]', "PREV"),
          Model.pointer < Model.list.length - 1
          ? m('button.mrxx', {
              onclick: () => {
                Model.current = Model.list[Model.pointer + 1]
                Model.pointer++}
            }, "NEXT")
          : m('button.btninvisn[disabled]', "NEXT"),
          Model.updated && m('b.red', "Movie updated!"),
          Model.deleted && m('b.red', "Movie deleted!")
        )
      ),
      !Model.current ? (m('div.row.mtxx', m('h2', "Nothing found"))) : m(EditInfo)
    )
  ]
}
export default Edit
