const Login = ({attrs: {S,A}}) => {
  sessionStorage.removeItem('movtok')

  const texts = [
    'Who disabled an unmarked unit, with a banana?',
    'Shall we play a game?',
    `Aren't you a little short for a stormtrooper?`,
    'Is it safe?',
    'Why so serious?',
    'What is the air speed velocity of an unladen swallow?',
    `What's in the box?`,
    'You know what they call a Quarter Pounder with cheese in France?',
    'Who is Keyser Söze?',
    'What is the Matrix?'
  ]
  
  const errors = [
    `I can't do that, Dave.`,
    `Frankly, my dear, I don't give a damn.`,
    'Just keep swimming...just keep swimming...',
    `What we've got here is failure to communicate.`,
    `Fasten your seatbelts. It's going to be a bumpy night.`,
    'Rosebud.',
    `You can't handle the truth!`,
    `Well, nobody's perfect.`,
    'Houston, we have a problem.',
    'Hasta la vista, baby.'
  ]
  
  const ran = nr => (Math.random() * nr) | 0

  let pass
  let text = texts[ran(10)]
  let show = false
  let emsg = ''

  // wait with showing the prompt
  setTimeout(() => {show = true; m.redraw()}, (text.length*100) + 100)

  const engage = () => {
    A.login(pass)
    .then(res => {
      try {sessionStorage.setItem('movtok', res.token)}
      catch(err) {A.error(err)}

      m.route.set('/')
    })
    .catch(err => {
      if (err.code === 401) {
        emsg = errors[ran(10)]
        m.redraw()
      }
      else A.error(err)
    })
  }

  let int

  return {
    onremove: () => clearInterval(int),
    view: () => [
      m('div' +z`abs; plt 0; size 100vw 100vh; bc #000; ff VT323; fs 24; c #44ff00; center`,
        m('div' +z`w ${text.length * 10}; tal`,
          m('span', {
            oncreate: ({dom}) => {
              for (let i=0; i < text.length; i++) setTimeout(() => dom.innerHTML += text[i], (i+1)*90)
            }
          }),
          m('br'),
          m('div',
            show && m('span', '>'),
            show && m('span#blink', {
              oncreate: () => int = setInterval(() => blink.style.visibility = (blink.style.visibility== 'hidden' ? 'visible' : 'hidden'), 500)
            }, '_'),
            m('input' +z`rel; bc #000; c transparent; bo 0; caret-color transparent; size 0; :focus {outline 0}; zi -1`, {
              type: 'password',
              oncreate: ({dom}) => dom.focus(),
              onupdate: ({dom}) => dom.focus(),
              oninput: e => pass = e.target.value,
              onkeydown: e => {if (e.key === 'Enter') engage()},
              value: pass
            })
          )
        ),
        emsg &&
        m('div' +z`abs; m 0 auto; pt 120; w ${emsg.length * 10}; tal; zi 1`, {
          oncreate: ({dom}) => {
            for (let i=0; i < emsg.length; i++) setTimeout(() => dom.innerHTML += emsg[i], (i+1)*90)
            setTimeout(() => {emsg = ''; m.redraw()}, (emsg.length*100) + 500)
          },
          onremove: () => clearTimeout()
        })
      )
    ]
  }
}

export default Login