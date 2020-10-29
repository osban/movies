const clone   = item => JSON.parse(JSON.stringify(item))
const omdbapi = (t, q, omdb) => 'https://private.omdbapi.com/?' + t + '=' + q + '&apikey=' + omdb

const api = {
  opts: (base = {}) => {
    base.headers = base.headers || {movtok: sessionStorage.getItem('movtok')}
    return base
  },
  req : (what, url, opts) => m.request({method: what, url, ...api.opts(opts)}),
  get : (url, opts) => api.req('get', url, opts),
  post: (url, opts) => api.req('post', url, opts),
  put : (url, opts) => api.req('put', url, opts),
  del : (url, opts) => api.req('delete', url, opts)
}

const postprep = (qone, obj = {}) => {
  const props = [
    'Actors','Country','Director','Genre','Language','Metascore',
    'Plot','Poster','Runtime','Title','Type','Writer','Year','imdbID',
    'imdbRating','seasonsowned','seasonsseen','disk','seen'
  ]
  Object.keys(qone)
  .filter(x => props.includes(x))
  .forEach(x => {
    const actions = {
      Actors:     () => {obj['cast']    = qone[x]},
      Runtime:    () => {obj['runtime'] = qone[x] !== 'N/A' ? qone[x].split(' ')[0] : ''},
      imdbID:     () => {obj['imdbid']  = qone[x]},
      imdbRating: () => {obj['rating']  = qone[x]}
    }
    if (x in actions) actions[x]()
    else obj[x.toLowerCase()] = qone[x]
  })
  obj['originaltitle'] = ''
  obj['notes']         = ''

  qone = clone(obj)
  return obj
}

const update = (movie, res) => new Promise((rs,rj) => {
  if (movie.rating !== res.imdbRating || movie.metascore !== res.Metascore || movie.poster !== res.Poster ||
      (movie.type === 'series' && +res.totalSeasons > movie.seasonsowned.length)) {
    movie.rating    = res.imdbRating
    movie.metascore = res.Metascore
    movie.poster    = res.Poster
    if (movie.type === 'series' && +res.totalSeasons > movie.seasonsowned.length) {
      for (let i=0; i < +res.totalSeasons - movie.seasonsowned.length + 1; i++) {
        movie.seasonsowned.push(false)
        movie.seasonsseen.push(false)
      }
    }

    api.put('/' + movie._id + '?update=true', {body: movie})
    .then(rs)
    .catch(rj)
  }
  else rs()
})

const Actions = (S, A = {
  error: ({code, response}) => {
    const header = code === 403 ? 'Well, what did you expect?' : 'Error'
    const text = typeof response === 'string' ? response : response.message
    
    S.modal = {
      type: 'error',
      content: {
        header,
        text: `(${code}) ${text}`
      }
    }
  },

  filtdisk: () => {
    const disks = [...new Set(S.list.map(x => x.disk))].sort((a,b) => a-b)
    S.filters.disk = [...['Disk'], ...disks]
    // if the last movie on a disk has been deleted
    if (!S.filters.disk.includes(S.filter.disk)) S.filter.disk = 'Disk'
  },

  // helper for sorting relatie table
  sort: list => ({
    onclick: e => {
      const prop = e.target.getAttribute('sortby')
      if (prop) {
        const first = list[0]

        list.sort((a,b) => a[prop] > b[prop] ? 1 : -1)

        if (list[0][prop] === first[prop]) list.reverse()
      }
    }
  }),

  login: pass => api.post('/login', {headers: {movtok: 'notok'}, body: {pass}}),

  get: () =>
    api.get('/all')
    .then(res => {
      S.list = res.list
      S.omdb = res.omdb
      // init disk filter array
      A.filtdisk()
      // init checks
      S.list.forEach(x => S.checks[x._id] = false)
      S.checks['all'] = false
    })
    .catch(A.error),
  post: () =>
    api.post('/', {body: postprep(S.qone)})
    .then(res => {
      S.list.push(res)
      // re-init disk filter
      A.filtdisk()
      S.snackbar = {
        text: 'Movie/series added.',
        atext: 'view',
        action: () => {
          S.movie = res
          S.page  = 'info'
          m.route.set('/movie')
          S.snackbar = null
        }
      }
    })
    .catch(A.error),
  put: () =>
    api.put('/' + S.movie._id, {body: S.movie})
    .then(() => {
      const index = S.list.findIndex(x => x._id === S.movie._id)
      S.list[index] = clone(S.movie)
      // re-init disk filter
      A.filtdisk()
      S.snackbar = {text: 'Movie(s)/series updated.'}
    })
    .catch(A.error),
  del: solo => {
    if (solo) S.checks[S.movie._id] = true

    const delone = (id, title) =>
      api.del('/' + id + '/' + title)
      .then(() => {
        S.list = S.list.filter(x => x._id !== id)
        S.checks[id] = false
        // re-init disk filter
        A.filtdisk()
      })
      .catch(A.error)

    Promise.all(
      Object.keys(S.checks)
      .filter(x => S.checks[x])
      .map(x => {
        const movie = S.list.find(y => y._id === x)
        delone(x, movie.title)
      })
    )
    .then(() => {
      S.page = 'list'
      m.route.set('/list')
      S.snackbar = {text: 'Movie(s)/series deleted.'}
    })
  },

  mm2hm: mins => {
    let time = ''
    if (+mins !== 0) {
      const hh = +mins / 60 | 0
      const mm = ('0' + (+mins % 60)).slice(-2)
      time = `${hh}:${mm}`
    }
    return time
  },

  checkit: which => {
    if (which === 'all') {
      Object.keys(S.checks).forEach(x => S.checks[x] = !S.checks[x])
    }
    else S.checks[which] = !S.checks[which]
  },

  selmovie: id => {
    const index = S.list.findIndex(x => x._id === id)
    // update data if needed
    m.request(omdbapi('i', S.list[index].imdbid, S.omdb))
    .then(res => {
      update(S.list[index], res)
      .then(() => {
        S.movie  = clone(S.list[index])
        S.page   = 'info'
        m.route.set('/movie')
        S.season = 0
      })
      .catch(A.error)
    })
  },

  setfilter: (which, value) => {
    S.filter[which] = 
      value === 'Yes' ? true  :
      value === 'No'  ? false :
      value
  },
  selclear: () => Object.keys(S.filters).forEach(x => S.filter[x] = S.filters[x][0]),

  seen: () => {
    const seenone = id => {
      S.list[S.list.findIndex(x => x._id === id)].seen = true

      return api.put('/' + id, {body: S.list[S.list.findIndex(x => x._id === id)]})
      .then(() => {
        S.checks[id] = false
        S.snackbar = {text: 'Movie(s)/series updated.'}
      })
      .catch(A.error)
    }

    Promise.all(
      Object.keys(S.checks)
      .filter(x => S.checks[x] === true)
      .map(x => seenone(x))
    )
  },

  geteps: nr =>
    m.request(omdbapi('i', S.movie.imdbid + '&Season=' + nr, S.omdb))
    .then(result => {
      S.eps = result
      S.season = nr
    })
    .catch(A.error),

  query: () =>
    m.request(omdbapi('s', S.find, S.omdb))
    .then(result => {
      S.qres = result
      if (S.qres.Response === 'False') S.show = 'No results.'
      else {
        if (S.qres.totalResults !== '1') {
          S.qpage = 1
          S.show  = 'list'
        }
        else {
          m.request(omdbapi('i', S.qres.Search[0].imdbID, S.omdb))
          .then(res => {
            S.qone = res
            S.qone.seen = false
            S.show = 'one'
          })
        }
      }
    })
    .catch(A.error),

  queryid: id =>
    m.request(omdbapi('i', id, S.omdb))
    .then(res => {
      S.qone = res
      S.qone.seen = false
      if (S.qone.totalSeasons) {
        S.qone.seasonsowned = [...new Array(+S.qone.totalSeasons).fill(false)]
        S.qone.seasonsseen  = [...new Array(+S.qone.totalSeasons).fill(false)]
      }
    })
    .catch(A.error),
  
  isprev: p => (((+p - 1) * 10) + 1) !== 1,
  isnext: (p, tot) => !(+p * 10 >= tot || +p * 10 > 1000),
  isporn: porn =>
    porn === 'prev'
    ? A.isprev(S.qpage)
    : A.isnext(S.qpage, +S.qres.totalResults),

  querypage: porn => {
    const page = '&page=' + (porn === 'next' ? ++S.qpage : --S.qpage)
    return m.request(omdbapi('s', S.find + page, S.omdb))
    .then(result => {S.qres = result})
    .catch(A.error)
  }
}) => A

export default Actions
