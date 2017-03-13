import m from "mithril"
import Movie from "./model"
import addseries from "./addseries"

module.exports = {
  view() {
    return m('div',
      m('div.row.mtxx',
        m('div.eight columns',
          m('h3', `${Movie.current.Title} (${Movie.current.Year})`),
          m('p',
            m('label', "plot:"),
            m('span', Movie.current.Plot)
          ),
          m('p',
            m('b', "director: "),
            m('span', Movie.current.Director)
          ),
          m('p',
            m('b', "writer: "),
            m('span', Movie.current.Writer),
            m('br'),
            m('b', "cast: "),
            m('span', Movie.current.Actors)
          ),
          m('div.row',
            m('div.one-half column',
              m('p',
                m('b', "country: "),
                m('span', Movie.current.Country),
                m('br'),
                m('b', "languages: "),
                m('span', Movie.current.Language),
                m('br'),
                m('b', "runtime: "),
                m('span', Movie.current.Runtime),
                m('br'),
                m('b', "genres: "),
                m('span', Movie.current.Genre),
                m('br'),
                m('b', "type: "),
                m('span', Movie.current.Type)
              )
            ),
            m('div.one-half column',
              m('p',
                m('b', "rating: "),
                m('span', Movie.current.imdbRating),
                m('b.mlxx', "metascore: "),
                m('span', Movie.current.Metascore),
                m('br'),
                m('b', "imdb: "),
                m('a', {href: "https://www.imdb.com/title/" + Movie.current.imdbID, target: "_blank"}, "www.imdb.com/title/" + Movie.current.imdbID),
                m('p'),
                m('b.labeltop', "notes: "),
                m('textarea.widthccc', {
                  onfocus: function() {this.select()},
                  oninput: m.withAttr('value', Movie.postdata.notes)}, Movie.postdata.notes()
                )
              )
            )
          )
        ),
        m('div.four columns',
          m('img', {src: Movie.current.Poster})
        )
      ),
      m('div.row',
        Movie.current.totalSeasons ? m(addseries) : null,
        m('span',
          m('b', "disk: "),
          m('input.adddisk[type=text]', {
            onfocus: function() {this.select()},
            oninput: m.withAttr('value', Movie.postdata.disk)}, Movie.postdata.disk()
          ),

          m('b.mlxx', "original title: "),
          m('input.widthccc[type=text]', {
            onfocus: function() {this.select()},
            oninput: m.withAttr('value', Movie.postdata.originaltitle)}, Movie.postdata.originaltitle()
          ),

          m('b.mlxx.labeltop', "seen: "),
          m('input[type=checkbox]', {
            onchange: m.withAttr('checked', Movie.postdata.seen)}, Movie.postdata.seen()
          ),

          m('button.button-primary.mlxxx', {onclick: () => Movie.postmovie()}, "Add")
        )
      )
    )
  }
}
