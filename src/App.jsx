import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HeroAtmosphere } from './components/HeroAtmosphere'
import { Preloader } from './components/Preloader'
import { projects } from './data/projects'

gsap.registerPlugin(ScrollTrigger)

function UiIcon({ type, className = '' }) {
  const paths = {
    arrowUpRight: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
    arrowLeft: <><path d="m15 18-6-6 6-6" /></>,
    arrowRight: <><path d="m9 18 6-6-6-6" /></>,
    arrowUp: <><path d="m6 10 6-6 6 6" /><path d="M12 4v16" /></>,
    play: <path d="m9 7 8 5-8 5Z" />,
    pause: <><path d="M9 7v10" /><path d="M15 7v10" /></>,
    sparkle: <path d="M12 3c.55 5.45 1.55 6.45 7 7-5.45.55-6.45 1.55-7 7-.55-5.45-1.55-6.45-7-7 5.45-.55 6.45-1.55 7-7Z" />,
  }

  return <svg className={`ui-icon ${className}`.trim()} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>
}

const Arrow = () => <UiIcon type="arrowUpRight" />
const PROJECT_AUTOPLAY_DELAY = 7000
const marqueeItems = [
  { label: 'Design', style: 'sans' },
  { label: 'Código', style: 'mono' },
  { label: 'Movimento', style: 'serif' },
  { label: 'Experiência', style: 'sans' },
  { label: 'Produto digital', style: 'serif' },
  { label: 'Tecnologia', style: 'mono' },
]

function ContactIcon({ type }) {
  const paths = {
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    linkedin: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-7M12 13.5c0-2 5-2.5 5 1V17" /></>,
    github: <><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.4 4 5 5 0 0 0 19.3.5S18.2.1 15 1.8a13.4 13.4 0 0 0-7 0C4.8.1 3.7.5 3.7.5A5 5 0 0 0 3.6 4a5.4 5.4 0 0 0-1.4 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4" /><path d="M8 19c-3 .9-3-1.5-4.2-2" /></>,
  }

  return <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>
}

const stackGroups = [
  { title: 'Desenvolvimento Web', index: '01', items: ['HTML', 'CSS', 'JAVASCRIPT', 'REACT'] },
  { title: 'Design e Prototipação', index: '02', items: ['FIGMA', 'CANVA'] },
  { title: 'Database e Ferramentas', index: '03', items: ['MYSQL', 'GIT', 'GITHUB', 'ANDROID STUDIO'] },
]

function App() {
  const reduceMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches).current
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches)
  const [marqueeRepeats, setMarqueeRepeats] = useState(() => Math.max(2, Math.ceil(window.innerWidth / 600) + 1))
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Todos')
  const [activeProject, setActiveProject] = useState(0)
  const [carouselHovered, setCarouselHovered] = useState(false)
  const [carouselAnimating, setCarouselAnimating] = useState(false)
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => !reduceMotion && !window.matchMedia('(max-width: 640px)').matches)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const mainRef = useRef(null)
  const cursorRef = useRef(null)
  const projectScrollRef = useRef(null)
  const programmaticScrollRef = useRef(false)
  const headerTimerRef = useRef(null)

  const filters = ['Todos', 'Mobile', 'Web', 'Sistemas']
  const filteredProjects = projects.filter((project) => {
    if (filter === 'Todos') return true
    if (filter === 'Mobile') return /Kotlin|Android/.test(`${project.tech} ${project.category}`)
    if (filter === 'Web') return /Web|React|JavaScript|HTML|CSS/.test(`${project.tech} ${project.category}`)
    return /Java|C|Systems|Desktop/.test(`${project.tech} ${project.category}`)
  })
  const autoplayAvailable = !reduceMotion && !isMobile
  const autoplayActive = autoplayAvailable && autoplayEnabled

  const finishLoading = useCallback(() => setLoading(false), [])

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 640px)')
    const updateDeviceMode = (event) => {
      setIsMobile(event.matches)
      if (event.matches) setAutoplayEnabled(false)
      if (!event.matches) setMobileMenuOpen(false)
    }

    mobileQuery.addEventListener('change', updateDeviceMode)
    return () => mobileQuery.removeEventListener('change', updateDeviceMode)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }

    setHeaderVisible(true)
    window.clearTimeout(headerTimerRef.current)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const updateMarqueeRepeats = () => {
      setMarqueeRepeats(Math.max(2, Math.ceil(window.innerWidth / 600) + 1))
    }

    window.addEventListener('resize', updateMarqueeRepeats)
    return () => window.removeEventListener('resize', updateMarqueeRepeats)
  }, [])

  useEffect(() => {
    if (loading) return
    if (reduceMotion) return undefined
    const ctx = gsap.context(() => {
      gsap.from('.hero-reveal', { yPercent: 120, duration: 1.15, stagger: 0.08, ease: 'power4.out' })
      gsap.from('.hero__portrait', { opacity: 0, y: 30, duration: 1, delay: 0.55, ease: 'power3.out' })

      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          y: 70,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%' },
        })
      })
    }, mainRef)
    return () => ctx.revert()
  }, [loading, reduceMotion])

  useEffect(() => {
    const cursor = cursorRef.current
    const move = (event) => gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: 0.35, ease: 'power3.out' })
    const grow = () => cursor.classList.add('cursor--active')
    const shrink = () => cursor.classList.remove('cursor--active')
    window.addEventListener('pointermove', move)
    const interactive = document.querySelectorAll('a, button, .project-card')
    interactive.forEach((el) => {
      el.addEventListener('mouseenter', grow)
      el.addEventListener('mouseleave', shrink)
    })
    return () => {
      window.removeEventListener('pointermove', move)
      interactive.forEach((el) => {
        el.removeEventListener('mouseenter', grow)
        el.removeEventListener('mouseleave', shrink)
      })
    }
  }, [loading, filter])

  const goToProject = useCallback((index, behavior = reduceMotion ? 'auto' : 'smooth') => {
    const scroller = projectScrollRef.current
    if (!scroller) return
    const cards = scroller.querySelectorAll('.project-card')
    if (!cards.length) return

    const normalizedIndex = (index + cards.length) % cards.length
    const card = cards[normalizedIndex]
    const centeredPosition = card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2
    gsap.killTweensOf(scroller)

    if (behavior === 'auto') {
      programmaticScrollRef.current = false
      setCarouselAnimating(false)
      scroller.scrollLeft = centeredPosition
    } else {
      programmaticScrollRef.current = true
      setCarouselAnimating(true)
      gsap.to(scroller, {
        scrollLeft: centeredPosition,
        duration: 0.78,
        ease: 'power3.inOut',
        overwrite: 'auto',
        onComplete: () => {
          programmaticScrollRef.current = false
          setCarouselAnimating(false)
        },
        onInterrupt: () => {
          programmaticScrollRef.current = false
          setCarouselAnimating(false)
        },
      })
    }
    setActiveProject(normalizedIndex)
  }, [reduceMotion])

  useEffect(() => {
    const scroller = projectScrollRef.current
    if (!scroller) return
    let animationFrame

    const updateCenteredProject = () => {
      if (programmaticScrollRef.current) return
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        const viewportCenter = scroller.scrollLeft + scroller.clientWidth / 2
        const cards = [...scroller.querySelectorAll('.project-card')]
        let closestIndex = 0
        let closestDistance = Infinity

        cards.forEach((card, index) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2
          const distance = Math.abs(viewportCenter - cardCenter)
          if (distance < closestDistance) {
            closestDistance = distance
            closestIndex = index
          }
        })
        setActiveProject(closestIndex)
      })
    }

    const initialPosition = requestAnimationFrame(() => goToProject(0, 'auto'))
    scroller.addEventListener('scroll', updateCenteredProject, { passive: true })
    window.addEventListener('resize', updateCenteredProject)

    return () => {
      cancelAnimationFrame(initialPosition)
      cancelAnimationFrame(animationFrame)
      scroller.removeEventListener('scroll', updateCenteredProject)
      window.removeEventListener('resize', updateCenteredProject)
    }
  }, [filter, goToProject])

  useEffect(() => {
    if (!autoplayActive || carouselHovered || filteredProjects.length < 2) return undefined
    const autoplay = window.setTimeout(() => goToProject(activeProject + 1), PROJECT_AUTOPLAY_DELAY)
    return () => window.clearTimeout(autoplay)
  }, [activeProject, autoplayActive, carouselHovered, filteredProjects.length, goToProject])

  useEffect(() => {
    let lastScroll = window.scrollY
    let ticking = false

    const scheduleHeaderHide = () => {
      window.clearTimeout(headerTimerRef.current)
      headerTimerRef.current = window.setTimeout(() => {
        if (window.scrollY > 80) setHeaderVisible(false)
      }, 5000)
    }

    const updateNavigation = () => {
      const currentScroll = window.scrollY
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(scrollableHeight > 0 ? currentScroll / scrollableHeight : 0)

      if (currentScroll <= 80) {
        setHeaderVisible(true)
        window.clearTimeout(headerTimerRef.current)
      } else if (currentScroll < lastScroll) {
        setHeaderVisible(true)
        scheduleHeaderHide()
      } else if (currentScroll > lastScroll + 3) {
        setHeaderVisible(false)
        window.clearTimeout(headerTimerRef.current)
      }

      lastScroll = currentScroll
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateNavigation)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateNavigation()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(headerTimerRef.current)
    }
  }, [])

  const showHeader = () => {
    setHeaderVisible(true)
    window.clearTimeout(headerTimerRef.current)
    if (window.scrollY > 80) {
      headerTimerRef.current = window.setTimeout(() => setHeaderVisible(false), 5000)
    }
  }

  return (
    <>
      {loading && <Preloader onComplete={finishLoading} />}
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <div className="cursor" ref={cursorRef} />
      <div className="page-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
      <main id="conteudo" ref={mainRef} tabIndex="-1">
        <header
          className={`nav ${headerVisible ? 'nav--visible' : 'nav--hidden'} ${scrollProgress === 0 ? 'nav--top' : ''} ${mobileMenuOpen ? 'nav--menu-open' : ''}`}
          onMouseEnter={showHeader}
          onFocusCapture={() => {
            setHeaderVisible(true)
            window.clearTimeout(headerTimerRef.current)
          }}
        >
          <a className="logo" href="#top" aria-label="Voltar ao início" onClick={() => setMobileMenuOpen(false)}>M<span>F</span></a>
          <nav className="desktop-nav" aria-label="Navegação principal">
            <a href="#top">Início</a>
            <a href="#stack">Stack</a>
            <a href="#formacao">Formação</a>
            <a href="#projetos">Projetos</a>
            <a href="#contato">Contato</a>
          </nav>
          <a className="availability" href="#contato"><i /> Disponível para projetos</a>
          <button
            className="mobile-menu__toggle"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="mobile-menu__label" aria-hidden="true">
              <span>Mais</span>
              <span>Fechar</span>
            </span>
            <span className="sr-only">{mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}</span>
            <i aria-hidden="true" />
          </button>
          {isMobile && mobileMenuOpen && (
            <div className="mobile-menu" id="mobile-navigation">
              <nav aria-label="Navegação mobile">
                {[
                  ['01', 'Início', '#top'],
                  ['02', 'Stack', '#stack'],
                  ['03', 'Formação', '#formacao'],
                  ['04', 'Projetos', '#projetos'],
                  ['05', 'Contato', '#contato'],
                ].map(([index, label, href]) => (
                  <a href={href} onClick={() => setMobileMenuOpen(false)} key={href}>
                    <span>{index}</span>
                    <strong>{label}</strong>
                    <Arrow />
                  </a>
                ))}
              </nav>
            </div>
          )}
        </header>

        <section className="hero" id="top">
          <HeroAtmosphere />
          <div className="hero__inner shell">
            <div className="hero__content">
              <div className="eyebrow"><span>01</span><span className="eyebrow__text">Desenvolvedor de Software · Brasília, DF</span></div>
              <p className="hero__hello hero-reveal">Olá, eu sou</p>
              <h1>
                <span className="hero-line"><span className="hero-reveal">Murilo Farias</span></span>
                <span className="hero-line"><span className="hero-reveal"><em>Silva.</em></span></span>
              </h1>
              <p className="hero__statement hero-reveal">Transformo lógica em experiências digitais que aproximam pessoas, ideias e tecnologia.</p>
              <div className="hero__actions hero-reveal">
                <a href="#projetos">Explorar projetos <Arrow /></a>
                <a href="https://www.linkedin.com/in/murilofariassilva" target="_blank" rel="noreferrer">LinkedIn <Arrow /></a>
              </div>
            </div>
            <div className="hero__portrait">
              <div className="hero__portrait-frame">
                <img src="/murilo-profile.jpeg" width="1200" height="1600" fetchPriority="high" alt="Murilo Farias Silva em seu espaço de desenvolvimento" />
              </div>
              <div className="hero__portrait-caption"><span>Desenvolvedor em formação</span><span>2026</span></div>
              <span className="hero__portrait-orbit" aria-hidden="true">Código · Produto · Movimento ·</span>
            </div>
          </div>
        </section>

        <section className="marquee" aria-hidden="true">
          <div className="marquee__ribbon">
            <div className="marquee__track" style={{ '--marquee-duration': `${marqueeRepeats * 12}s` }}>
              {[0, 1].map((group) => (
                <div className="marquee__group" key={group}>
                  {Array.from({ length: marqueeRepeats }, (_, repeat) => (
                    <span className="marquee__sequence" key={`${group}-${repeat}`}>
                      {marqueeItems.map((item) => (
                        <span className={`marquee__item marquee__item--${item.style}`} key={`${group}-${repeat}-${item.label}`}>
                          {item.label}<UiIcon type="sparkle" className="marquee__sparkle" />
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="stack section" id="stack">
          <div className="stack__head shell" data-reveal>
            <div className="section-index"><span>02</span><p>Stack tecnológica</p></div>
            <h2>Ferramentas que<br /><em>movem ideias.</em></h2>
            <p>Um repertório em constante evolução para construir produtos do primeiro rascunho à experiência final.</p>
          </div>
          <div className="stack__grid shell">
            {stackGroups.map((group) => (
              <article className="stack-card" key={group.title} tabIndex="0" aria-label={`${group.title}: ${group.items.join(', ')}`} data-reveal>
                <div className="stack-card__head">
                  <span>/{group.index}</span>
                  <h3>{group.title}</h3>
                </div>
                <span className="stack-card__watermark" aria-hidden="true">{group.title.slice(0, 2)}</span>
                <div className="stack-card__items">
                  {group.items.map((item) => <span key={item}>{item}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="journey section" id="formacao" aria-label="Formação acadêmica e certificações">
          <div className="journey__head shell" data-reveal>
            <div className="section-index"><span>03</span><p>Formação acadêmica e certificações</p></div>
            <h2>Aprendizado<br /><em>em evolução.</em></h2>
            <p>Graduação e aprendizado complementar reunidos em uma trajetória prática e contínua.</p>
          </div>
          <div className="shell journey__cards">
            <div className="education" data-reveal>
              <div className="education__topline"><span>Universidade Católica de Brasília</span><span className="education__status">Em formação</span></div>
              <div className="education__content">
                <p>Graduação</p>
                <h2>Análise e Desenvolvimento<br />de Sistemas</h2>
                <div className="education__meta">
                  <span>Curso superior de tecnologia</span>
                  <span>UCB · Brasília</span>
                </div>
              </div>
              <span className="education__mark">ADS</span>
            </div>
            <a className="credential-card" href="https://www.linkedin.com/in/murilofariassilva/details/certifications/" target="_blank" rel="noreferrer" data-reveal>
              <div className="credential-card__top"><ContactIcon type="linkedin" /><span>LinkedIn</span></div>
              <div className="credential-card__content">
                <small>Credenciais verificadas</small>
                <h2>Certificados e licenças</h2>
                <p>Consulte a relação atualizada de certificados publicados no meu perfil profissional.</p>
              </div>
              <span className="credential-card__link">Visualizar credenciais <Arrow /></span>
            </a>
          </div>
        </section>

        <section className="projects section" id="projetos">
          <div className="shell projects__head" data-reveal>
            <div className="section-index"><span>04</span><p>Projetos selecionados</p></div>
            <h2>Projetos e<br /><em>atividades.</em></h2>
            <p>Projetos acadêmicos, estudos e soluções práticas que registram minha evolução como desenvolvedor.</p>
          </div>

          <div className="filters shell" data-reveal>
            {filters.map((item) => (
              <button aria-pressed={filter === item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>
            ))}
          </div>

          <div
            className={`project-carousel ${!autoplayActive ? 'project-carousel--paused' : ''} ${carouselHovered ? 'project-carousel--interacting' : ''} ${carouselAnimating ? 'project-carousel--animating' : ''}`}
            onMouseEnter={() => setCarouselHovered(true)}
            onMouseLeave={() => setCarouselHovered(false)}
            onFocusCapture={() => setCarouselHovered(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setCarouselHovered(false)
            }}
            data-reveal
          >
            <div className="project-carousel__controls shell">
              <div className="project-carousel__status">
                <span>{String(activeProject + 1).padStart(2, '0')}</span>
                <i key={`${activeProject}-${carouselHovered}-${autoplayActive}`} />
                <span>{String(filteredProjects.length).padStart(2, '0')}</span>
              </div>
              <p aria-live="polite">{isMobile ? 'Navegação manual no celular' : reduceMotion ? 'Movimento reduzido ativado' : !autoplayEnabled ? 'Reprodução automática desativada' : carouselHovered ? 'Navegação pausada' : 'Próximo projeto em 7s'}</p>
              <div className="project-carousel__buttons">
                <button type="button" onClick={() => goToProject(activeProject - 1)} aria-label="Projeto anterior"><UiIcon type="arrowLeft" /></button>
                <button
                  className="project-carousel__toggle"
                  type="button"
                  aria-pressed={!autoplayEnabled}
                  disabled={!autoplayAvailable}
                  onClick={() => setAutoplayEnabled((enabled) => !enabled)}
                  aria-label={!autoplayAvailable ? 'Troca automática indisponível neste dispositivo' : autoplayEnabled ? 'Pausar troca automática' : 'Retomar troca automática'}
                >
                  <UiIcon type={autoplayEnabled ? 'pause' : 'play'} />
                </button>
                <button type="button" onClick={() => goToProject(activeProject + 1)} aria-label="Próximo projeto"><UiIcon type="arrowRight" /></button>
              </div>
            </div>
            <div
              className={`project-scroll ${carouselAnimating ? 'project-scroll--animating' : ''}`}
              ref={projectScrollRef}
              tabIndex="0"
              role="region"
              aria-label="Carrossel de projetos"
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') {
                  event.preventDefault()
                  goToProject(activeProject - 1)
                }
                if (event.key === 'ArrowRight') {
                  event.preventDefault()
                  goToProject(activeProject + 1)
                }
              }}
            >
              <div className="project-grid">
                {filteredProjects.map((project, index) => (
                  <article className={`project-card ${index === activeProject ? 'project-card--active' : ''}`} aria-current={index === activeProject ? 'true' : undefined} key={project.slug}>
                    <a href={project.live || project.github} target="_blank" rel="noreferrer" aria-label={`Abrir ${project.title}`}>
                      <div className="project-card__visual" style={{ '--accent': project.color || '#2b2d28' }}>
                        <span className="project-card__number">/{String(index + 1).padStart(2, '0')}</span>
                        <div className="project-card__monogram">{project.title.split(' ').map((word) => word[0]).slice(0, 3).join('')}</div>
                        <div className="project-card__orb" />
                        <span className="project-card__open"><Arrow /></span>
                      </div>
                      <div className="project-card__info">
                        <div>
                          <h3>{project.title}</h3>
                          <p>{project.description}</p>
                        </div>
                        <div className="project-card__meta"><span>{project.category}</span><span>{project.tech}</span><span>{project.year}</span></div>
                      </div>
                      <span className="project-card__action">{project.live ? 'Visitar projeto' : 'Explorar código'} <Arrow /></span>
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="contact section" id="contato">
          <div className="shell contact__inner" data-reveal>
            <div className="contact__head">
              <div className="section-index"><span>05</span><p>Vamos conversar</p></div>
              <h2>Vamos criar algo<br /><em>relevante.</em></h2>
              <p className="contact__kicker">Estou aberto a oportunidades, colaborações e boas conversas sobre tecnologia, produto e novas ideias.</p>
            </div>
            <div className="contact__channels">
              <a className="contact-card" href="mailto:murilofsilva.dev@gmail.com">
                <div className="contact-card__top"><ContactIcon type="email" /><span>01</span></div>
                <div className="contact-card__body"><small>E-mail</small><strong>murilofsilva.dev@gmail.com</strong><p>Para propostas e contatos diretos.</p></div>
                <span className="contact-card__action">Escrever mensagem <Arrow /></span>
              </a>
              <a className="contact-card" href="https://www.linkedin.com/in/murilofariassilva" target="_blank" rel="noreferrer">
                <div className="contact-card__top"><ContactIcon type="linkedin" /><span>02</span></div>
                <div className="contact-card__body"><small>LinkedIn</small><strong>Murilo Farias Silva</strong><p>Trajetória, formação e conexões profissionais.</p></div>
                <span className="contact-card__action">Conectar no LinkedIn <Arrow /></span>
              </a>
              <a className="contact-card" href="https://github.com/murilosilva100" target="_blank" rel="noreferrer">
                <div className="contact-card__top"><ContactIcon type="github" /><span>03</span></div>
                <div className="contact-card__body"><small>GitHub</small><strong>@murilosilva100</strong><p>Código, estudos e projetos em evolução.</p></div>
                <span className="contact-card__action">Explorar repositórios <Arrow /></span>
              </a>
            </div>
          </div>
          <footer className="shell footer">
            <p>(c) 2026 Murilo Farias Silva</p>
            <div className="footer__links">
              <a href="mailto:murilofsilva.dev@gmail.com">E-mail</a>
              <a href="https://github.com/murilosilva100" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/murilofariassilva" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </footer>
        </section>
      </main>
    </>
  )
}

export default App
