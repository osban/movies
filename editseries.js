import m from "mithril"
import Model from "./model"

const EditSeries = {
  view: () => [
    m('div',
      m('b', "owned:"),
      m('br'),
      Model.current.seasonsowned.map((item, i) => [
        m('span',
          m('input', {
            type: 'checkbox',
            name: i+1,
            checked: Model.current.seasonsowned[i],
            onchange: () => {Model.current.seasonsowned[i] = !Model.current.seasonsowned[i]}}
          ),
          m('b.season.labeltop', "Season " + i+1)
        )
      ]),
      m('br'),
      m('b', "seen:"),
      m('br'),
      Model.current.seasonsseen.map((item, i) => [
        m('span',
          m('input', {
            type: 'checkbox',
            name: i+1,
            checked: Model.current.seasonsseen[i],
            onchange: () => {Model.current.seasonsseen[i] = !Model.current.seasonsseen[i]}}
          ),
          m('b.season.labeltop', "Season " + i+1)
        )
      ]),
      m('br'),
      m('button#add', {
        onclick: () => {Model.current.seasonsowned.push(false); Model.current.seasonsseen.push(false); Model.current.seasons++}},
        "Add season"
      ),
      m('button', {
        onclick: () => {Model.current.seasonsowned.pop(); Model.current.seasonsseen.pop(); Model.current.seasons--}},
        "Remove season"
      )
    )
  ]
}

export default EditSeries
