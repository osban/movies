import m from "mithril"
import s from "mithril/stream"
import Model from "./model"
import ViewInfo from "./viewinfo"

const View = {
  find: zoek => {
    const found = Model.list.find((item, i) => {
      if (item.title.toLowerCase().indexOf(zoek.toLowerCase()) > -1) Model.pointer = i
        return item.title.toLowerCase().indexOf(zoek.toLowerCase()) > -1
    })
    if (found) Model.current = found
  },

  prevnext: porn => {
    if (porn === "prev") {
      Model.current = Model.list[Model.pointer - 1]
      Model.pointer--
    }
    else {
      Model.current = Model.list[Model.pointer + 1]
      Model.pointer++
    }
    Model.showeps = false
  },

  oninit: ({state, attrs}) => {
    state.zoekterm = s("")

    // If reload, go to list page
    if (!Model.list.length) m.route.set("/")

    // find specific Model or load first one
    if (attrs.id === "0") Model.current = Model.list[0]
    else {
      Model.current = Model.list.find((item, i) => {
        if (item._id === attrs.id) Model.pointer = i
        return item._id === attrs.id
      })
    }
    Model.showeps = false
    Model.list[0] && Model.current.year ? Model.year = "(" + Model.current.year + ")" : Model.year = ""
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
            oninput: m.withAttr('value', state.zoekterm),
            onkeypress: e => {
              if (e.keyCode === 13 && state.zoekterm() !== "") {
                View.find(state.zoekterm())
                e.target.blur()
              }
            },
            onchange: () => {if (state.zoekterm() !== "") View.find(state.zoekterm())}
          }),
          Model.pointer > 0
          ? m('button.btnprev', {onclick: () => View.prevnext("prev")}, "PREV")
          : m('button.btninvisp[disabled]', "PREV"),
          Model.pointer < Model.list.length - 1
          ? m('button.mrxx', {onclick: () => View.prevnext("next")}, "NEXT")
          : m('button.btninvisn[disabled]', "NEXT"),
          m('button.button-primary', {onclick: () => m.route.set("/edit/" + Model.current._id)}, "EDIT")
        )
      ),
      !Model.current ? (m('div.row.mtxx', m('h2', "Nothing found"))) : m(ViewInfo)
    )
  ]
}
export default View
