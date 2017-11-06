const Slideshow = (container, slides, indicators, options) => {
  let timer = null

  const default_options = {
      currentIndex: 0,
      playing: true,
      interval: 5, // in seconds
  }

  options = Object.assign({}, default_options, options || {})

  const currentSlide = () => slides[options.currentIndex]
  const getIndex = (index) => (index < 0 ? index + slides.length : index) % slides.length

  const addClass = el => cls => el.classList.add(cls)
  const addClasses = el => clss => clss.map(addClass(el))
  const removeClass = el => cls => el.classList.remove(cls)
  const removeClasses = el => clss => clss.map(removeClass(el))

  const changeIndex = index => options.currentIndex = index

  const next = (pauseAfter = false) => walk_to(options.currentIndex + 1, pauseAfter)
  const prev = (pauseAfter = false) => walk_to(options.currentIndex - 1, pauseAfter)

  const walk_to = (index, pauseAfter = false) => {
    var dir = (index > options.currentIndex) ? 'next' : 'prev'
    var normalizedIndex = getIndex(index)

    slides[normalizedIndex].classList.add(dir)
    // Wait for the .next and .prev classes to be set before .animation is set
    setTimeout(() => addClasses(container)(['animation', 'animation-'+dir]), 16)
    const stop = () => {
      removeClasses(container)(['animation', 'animation-next', 'animation-prev'])
      slides.forEach(s => removeClasses(s)(['next', 'current', 'prev']))
      currentSlide().removeEventListener('transitionend', stop)
      changeIndex(normalizedIndex)
      addClass(currentSlide())('current')
      indicators.forEach(i => removeClass(i)('current'))
      addClass(indicators[options.currentIndex])('current')
      if (pauseAfter) pause()
    }
    currentSlide().addEventListener('transitionend', stop)
  }

  var touchEvents = []
  var is_enough = (min, v) => (Math.abs(v) < min) ? 0 : v/Math.abs(v);

  const touch = ev => touchEvents.push(ev.changedTouches[0].clientX)

  const touchEnd = ev => {
    touchEvents.push(ev.changedTouches[0].clientX)
    var diff = is_enough(100, touchEvents[1] - touchEvents[0])*-1
    if (diff !== 0) {
      walk_to(options.currentIndex + diff, true)
    }
    touchEvents = []
  }

  container.addEventListener('touchstart', touch, {passive: true})
  container.addEventListener('touchend', touchEnd, {passive: true})

  const play = _ => {
    if (options.playing) return;

    options.playing = true
    enqueue()
  }

  const pause = _ => {
    options.playing = false
    clearTimeout(timer)
  }

  const enqueue = _ => timer = setInterval(next, options.interval*1000)

  if (options.playing) {
    enqueue()
  }

  // setup pause on hover
  container.addEventListener('mouseenter', (ev) => {
    if (options.playing) {
      container.addEventListener('mouseleave', play)
    }

    pause()
  })

  indicators.forEach((el, i) => el.addEventListener('click', walk_to.bind(null, i, true)))

  return {
    next: next,
    prev: prev
  }
}