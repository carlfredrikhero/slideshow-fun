const Slideshow = (container, slides, indicators) => {
  var currentIndex = 0;
  var steps = 0;

  const current = _ => slides[currentIndex]
  const next = _ => slides[(currentIndex + 1) % slides.length]
  const prev = _ => slides[(currentIndex === 0) ? slides.length - 1 : currentIndex -1 ]

  // Calculates new index based on currentIndex + number of steps
  const addToIndex = (steps) => setIndex(currentIndex + (steps))
  const setIndex = (index) => currentIndex = (index < 0) ? slides.length + (index) : index % slides.length

  const removeClasses = clss => el => el.classList.remove(...clss)
  const addClasses = clss => el => el.classList.add(...clss)

  const reduceSteps = () => {
    switch (true) {
      case (steps > 0):
        steps = steps - 1
        break;
      case (steps < 0):
        steps = steps + 1
        break;
    }
  }

  const stopAnimation = () => {
    removeClasses(['animation', 'animation-next', 'animation-prev'])(container);
    current().removeEventListener('transitionend', stopAnimation)

    render()
    reduceSteps()
    if (steps !== 0){
      startAnimation()
    }
  }

  const startAnimation = () => {
    console.log(steps)
    if (steps === 0) return;
    var dir = (steps > 0) ? 'animation-next' : 'animation-prev'
    addClasses(['animation', dir])(container)
    current().addEventListener('transitionend', stopAnimation)
    addToIndex(steps)
  }

  const render = () => {
    // remove old classes
    slides.forEach(removeClasses(['next', 'current', 'prev']))
    indicators.forEach(removeClasses(['current']))
    // add new classes
    addClasses(['prev'])(prev())
    addClasses(['current'])(current())
    addClasses(['next'])(next())

    addClasses(['current'])(indicators[currentIndex])
  }

  const walk = (s) => {
    if (s === 0) return;
    steps = s
    startAnimation()
  }

  const walk_to = (index) => {
    if (currentIndex === index) return;
    steps = index - currentIndex
    startAnimation()
  }

  var touchEvents = []
  var is_enough = (min, v) => (v < min) ? 1 : 0;

  function touch (ev) {
    touchEvents.push(ev.changedTouches[0].clientX)
  }

  function touchEnd (ev) {
    touchEvents.push(ev.changedTouches[0].clientX)
    walk(is_enough(-10, touchEvents[1] - touchEvents[0]))
    touchEvents = []
  }

  container.addEventListener('touchstart', touch)
  container.addEventListener('touchend', touchEnd)

  indicators.forEach(i => {
    i.addEventListener('click', (ev) => {
      walk_to(indicators.indexOf(ev.target))
    })
  })

  return {
    walk: walk,
    walk_to: walk_to
  }
}