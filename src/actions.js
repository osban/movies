const clone = item => JSON.parse(JSON.stringify(item))
const omdbapi = (t, q, omdb) => 'http://private.omdbapi.com/?' + t + '=' + q + '&apikey=' + omdb
const isprev = p => (((Number(p) - 1) * 10) + 1) !== 1 ? true : false
const isnext = (p, tot) => (Number(p) * 10 >= tot || Number(p) * 10 > 1000) ? false : true

const filtdisk = state => {
  const disks = [...new Set(state.list.map(x => x.disk))].sort((a,b) => a-b)
  state.filters.disk = [...['Disk'], ...disks]
  if (!state.filters.disk.includes(state.filter.disk)) state.filter.disk = 'Disk'
}

const postprep = qone => {
  const obj = {}
  const props = [
    'Actors','Country','Director','Genre','Language','Metascore',
    'Plot','Poster','Runtime','Title','Type','Writer','Year','imdbID',
    'imdbRating','seasonsowned','seasonsseen','disk','seen'
  ]
  Object.keys(qone)
  .filter(x => props.includes(x))
  .forEach(x => {
    const actions = {
      Actors:     () => {obj['cast']      = qone[x]},
      Runtime:    () => {obj['runtime']   = qone[x] !== 'N/A' ? qone[x].split(' ')[0] : ''},
      imdbID:     () => {obj['imdbid']    = qone[x]},
      imdbRating: () => {obj['rating']    = qone[x]}
    }
    if (actions.hasOwnProperty(x)) actions[x]()
    else obj[x.toLowerCase()] = qone[x]
  })
  obj['originaltitle'] = ''
  obj['notes']         = ''

  qone = clone(obj)
  return obj
}

const update = (movie, res) => new Promise((resolve, reject) => {
  if (movie.rating !== res.imdbRating || movie.metascore !== res.Metascore ||
      movie.poster !== res.Poster || (movie.type === 'series' && Number(res.totalSeasons) > movie.seasonsowned.length)) {
    movie.rating    = res.imdbRating
    movie.metascore = res.Metascore
    movie.poster    = res.Poster
    if (Number(res.totalSeasons) > movie.seasonsowned.length) {
      for (let i=0; i < Number(res.totalSeasons) - movie.seasonsowned.length + 1; i++) {
        movie.seasonsowned.push(false)
        movie.seasonsseen.push(false)
      }
    }
    m.request({
      method: 'PUT',
      url: '/put/' + movie._id,
      data: movie
    })
    .then(() => resolve())
    .catch(reject)
  }
  else resolve()
})

const error = (state, err) => {
  state.modal = {
    type: 'error',
    content: {
      text: err
    }
  }
}

const Actions = state => ({
  get: () =>
    m.request({url: '/get'})
    .then(res => {
      state.list = res.list
      state.omdb = res.omdb
      // init disk filter array
      filtdisk(state)
      // init checks
      state.list.forEach(x => state.checks[x._id] = false)
      state.checks['all'] = false
    })
    .catch(err => error(state, err.message)),
  post: () =>
    m.request({
      method: 'POST',
      url: '/post',
      data: postprep(state.qone)
    })
    .then(res => {
      state.list.push(res)
      state.qone = {}
      // re-init disk filter
      filtdisk(state)
      state.snackbar = {
        text: 'Movie/series added.',
        atext: 'view',
        action: () => {
          state.movie = res
          state.page = 'info'
          state.snackbar = null
        }
      }
    })
    .catch(err => error(state, err.message)),
  put: () =>
    m.request({
      method: 'PUT',
      url: '/put/' + state.movie._id,
      data: state.movie
    })
    .then(() => {
      const index = state.list.findIndex(x => x._id === state.movie._id)
      state.list[index] = clone(state.movie)
      // re-init disk filter
      filtdisk(state)
      state.snackbar = {text: 'Movie(s)/series updated.'}
    })
    .catch(err => error(state, err.message)),
  del: solo => {
    if (solo) state.checks[state.movie._id] = true

    const delone = (id, title) =>
      m.request({
        method: 'DELETE',
        url: '/del/' + id + '/' + title
      })
      .then(() => {
        state.list = state.list.filter(x => x._id !== id)
        state.checks[id] = false
        // re-init disk filter
        filtdisk(state)
      })
      .catch(err => error(state, err.message))

    Promise.all(
      Object.keys(state.checks)
      .filter(x => state.checks[x] === true)
      .map(x => {
        const movie = state.list.find(y => y._id === x)
        delone(x, movie.title)
      })
    )
    .then(() => {
      state.page = 'list'
      state.snackbar = {text: 'Movie(s)/series deleted.'}
    })
  },

  mm2hm: mins => {
    let time = ''
    if (Number(mins) !== 0) {
      const hh = Number(mins) / 60 | 0
      let mm = Number(mins) % 60
      if (mm < 10) mm = '0' + mm
      time = `${hh}:${mm}`
    }
    return time
  },

  checkit: which => {
    if (which === 'all') {
      Object.keys(state.checks).forEach(x => state.checks[x] = !state.checks[x])
    }
    else state.checks[which] = !state.checks[which]
  },

  selmovie: id => {
    const index = state.list.findIndex(x => x._id === id)
    // update data
    m.request({url: omdbapi('i', state.list[index].imdbid, state.omdb)})
    .then(res => {
      update(state.list[index], res)
      .then(() => {
        state.movie = clone(state.list[index])
        state.page = 'info'
        state.season = 0
      })
      .catch(err => error(state, err.message))
    })
  },

  setfilter: (which, value) => {
    state.filter[which] = value === 'Yes' ? true
      : value === 'No' ? false
      : value
  },
  selclear: () => Object.keys(state.filters).forEach(x => state.filter[x] = state.filters[x][0]),

  seen: () => {
    const seenone = id => {
      state.list[state.list.findIndex(x => x._id === id)].seen = true

      return m.request({
        method: 'PUT',
        url: '/put/' + id,
        data: state.list[state.list.findIndex(x => x._id === id)]
      })
      .then(() => {
        state.checks[id] = false
        state.snackbar = {
          text: 'Movie(s)/series updated.'
        }
      })
      .catch(err => error(state, err.message))
    }

    Promise.all(
      Object.keys(state.checks)
      .filter(x => state.checks[x] === true)
      .map(x => seenone(x))
    )
  },

  geteps: nr =>
    m.request({url: omdbapi('i', state.movie.imdbid + '&Season=' + nr, state.omdb)})
    .then(result => {
      state.eps = result
      state.season = nr
    })
    .catch(err => error(state, err.message)),

  query: () =>
    m.request({url: omdbapi('s', state.find, state.omdb)})
    .then(result => {
      state.qres = result
      if (state.qres.Response === 'False') state.show = 'No results.'
      else {
        if (state.qres.totalResults !== '1') {
          state.qpage = 1
          state.show = 'list'
        }
        else {
          m.request({url: omdbapi('i', state.qres.Search[0].imdbID, state.omdb)})
          .then(result => {
            state.qone = result
            state.show = 'one'
          })
        }
      }
    })
    .catch(err => error(state, err.message)),

  queryid: id =>
    m.request({url: omdbapi('i', id, state.omdb)})
    .then(res => {
      state.qone = res
      state.qone.seen = false
      if (state.qone.totalSeasons) {
        state.qone.seasonsowned = [...new Array(Number(state.qone.totalSeasons)).fill(false)]
        state.qone.seasonsseen  = [...new Array(Number(state.qone.totalSeasons)).fill(false)]
      }
    })
    .catch(err => error(state, err.message)),

  isporn: porn => porn === 'prev'
    ? isprev(state.qpage)
    : isnext(state.qpage, Number(state.qres.totalResults)),

  querypage: porn => {
    const page = '&page=' + (porn === 'next' ? ++state.qpage : --state.qpage)
    return m.request({url: omdbapi('s', state.find + page, state.omdb)})
    .then(result => {state.qres = result})
    .catch(err => error(state, err.message))
  }
})

export default Actions