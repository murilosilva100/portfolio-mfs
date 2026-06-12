import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HeroAtmosphere } from './components/HeroAtmosphere'
import { Preloader } from './components/Preloader'
import { projects } from './data/projects'

gsap.registerPlugin(ScrollTrigger)

const Arrow = () => <span aria-hidden="true">↗</span>

const stackGroups = [
  { title: 'Front-End', index: '01', items: ['HTML', 'CSS', 'JavaScript', 'React', 'Vite'] },
  { title: 'Mobile', index: '02', items: ['Kotlin', 'Android Studio', 'Jetpack Compose'] },
  { title: 'Back-End', index: '03', items: ['Java', 'FastAPI', 'Node.js'] },
  { title: 'Banco de Dados', index: '04', items: ['MySQL', 'SQLite'] },
  { title: 'Ferramentas', index: '05', items: ['Git', 'GitHub', 'Figma', 'Postman'] },
]

function App() {
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Todos')
  const [activeProject, setActiveProject] = useState(0)
  const [carouselHovered, setCarouselHovered] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
  const mainRef = useRef(null)
  const cursorRef = useRef(null)
  const projectScrollRef = useRef(null)
  const headerTimerRef = useRef(null)

  const filters = ['Todos', 'Mobile', 'Web', 'Sistemas']
  const filteredProjects = projects.filter((project) => {
    if (filter === 'Todos') return true
    if (filter === 'Mobile') return /Kotlin|Android/.test(`${project.tech} ${project.category}`)
    if (filter === 'Web') return /Web|React|JavaScript|HTML|CSS/.test(`${project.tech} ${project.category}`)
    return /Java|C|Systems|Desktop/.test(`${project.tech} ${project.category}`)
  })

  const finishLoading = useCallback(() => setLoading(false), [])

  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.from('.hero-reveal', { yPercent: 120, duration: 1.15, stagger: 0.08, ease: 'power4.out' })
      gsap.from('.hero__portrait, .hero__scroll', { opacity: 0, y: 30, duration: 1, delay: 0.55, stagger: 0.12, ease: 'power3.out' })

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
  }, [loading])

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

  const goToProject = useCallback((index, behavior = 'smooth') => {
    const scroller = projectScrollRef.current
    if (!scroller) return
    const cards = scroller.querySelectorAll('.project-card')
    if (!cards.length) return

    const normalizedIndex = (index + cards.length) % cards.length
    const card = cards[normalizedIndex]
    const centeredPosition = card.offsetLeft - (scroller.clientWidth - card.offsetWidth) / 2
    scroller.scrollTo({ left: centeredPosition, behavior })
    setActiveProject(normalizedIndex)
  }, [])

  useEffect(() => {
    const scroller = projectScrollRef.current
    if (!scroller) return
    let animationFrame

    const updateCenteredProject = () => {
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
    if (carouselHovered || filteredProjects.length < 2) return undefined
    const autoplay = window.setInterval(() => goToProject(activeProject + 1), 10000)
    return () => window.clearInterval(autoplay)
  }, [activeProject, carouselHovered, filteredProjects.length, goToProject])

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
      <div className="cursor" ref={cursorRef} />
      <div className="page-progress" aria-hidden="true"><span style={{ transform: `scaleX(${scrollProgress})` }} /></div>
      <main ref={mainRef}>
        <header className={`nav ${headerVisible ? 'nav--visible' : 'nav--hidden'} ${scrollProgress === 0 ? 'nav--top' : ''}`} onMouseEnter={showHeader}>
          <a className="logo" href="#top" aria-label="Voltar ao início">M<span>F</span></a>
          <nav aria-label="Navegação principal">
            <a href="#top">Início</a>
            <a href="#stack">Stack</a>
            <a href="#formacao">Formação</a>
            <a href="#certificacoes">Certificações</a>
            <a href="#projetos">Experiência</a>
            <a href="#contato">Contato</a>
          </nav>
          <a className="availability" href="#contato"><i /> Disponível para projetos</a>
        </header>

        <section className="hero" id="top">
          <HeroAtmosphere />
          <div className="hero__inner shell">
            <div className="hero__content">
              <div className="eyebrow"><span>01</span> Desenvolvedor de software · Brasil</div>
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
                <img src="/murilo-profile.jpeg" alt="Murilo Farias Silva em seu espaço de desenvolvimento" />
              </div>
              <div className="hero__portrait-caption"><span>Desenvolvedor em formação</span><span>2026</span></div>
              <span className="hero__portrait-orbit" aria-hidden="true">Código · Produto · Movimento ·</span>
            </div>
          </div>
          <a className="hero__scroll" href="#stack"><span>Descobrir</span><i /></a>
        </section>

        <section className="marquee" aria-hidden="true">
          <div className="marquee__track">
            <span>DESIGN · CÓDIGO · MOVIMENTO · EXPERIÊNCIA · </span>
            <span>DESIGN · CÓDIGO · MOVIMENTO · EXPERIÊNCIA · </span>
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
              <article className="stack-card" key={group.title} data-reveal>
                <div className="stack-card__head">
                  <span>/{group.index}</span>
                  <h3>{group.title}</h3>
                </div>
                <div className="stack-card__items">
                  {group.items.map((item) => <span key={item}>{item}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="journey section" id="formacao">
          <div className="shell journey__layout">
            <div className="section-index" data-reveal><span>03</span><p>Formação acadêmica</p></div>
            <div className="education" data-reveal>
              <span className="education__status">Em formação</span>
              <div className="education__content">
                <p>Graduação</p>
                <h2>Análise e Desenvolvimento<br />de Sistemas</h2>
                <div className="education__meta">
                  <span>Universidade Católica de Brasília</span>
                  <span>UCB</span>
                </div>
              </div>
              <span className="education__mark">ADS</span>
            </div>
          </div>
        </section>

        <section className="certifications section" id="certificacoes">
          <div className="shell certifications__layout">
            <div className="section-index" data-reveal><span>04</span><p>Certificações</p></div>
            <div className="certifications__intro" data-reveal>
              <h2>Aprendizado<br /><em>contínuo.</em></h2>
              <p>Cursos, credenciais e estudos complementares que expandem minha prática além da formação acadêmica.</p>
            </div>
            <a className="credential-card" href="https://www.linkedin.com/in/murilofariassilva/details/certifications/" target="_blank" rel="noreferrer" data-reveal>
              <div className="credential-card__top"><span>Credenciais verificadas</span><Arrow /></div>
              <div className="credential-card__seal">in</div>
              <div>
                <h3>Certificados e licenças</h3>
                <p>Consulte a relação atualizada de certificados publicados no meu perfil profissional.</p>
              </div>
              <span className="credential-card__link">Visualizar no LinkedIn</span>
            </a>
          </div>
        </section>

        <section className="projects section" id="projetos">
          <div className="shell projects__head" data-reveal>
            <div className="section-index"><span>05</span><p>Projetos selecionados</p></div>
            <h2>Experiência<span>.</span></h2>
            <p className="projects__count">{String(filteredProjects.length).padStart(2, '0')} projetos públicos</p>
          </div>

          <div className="filters shell" data-reveal>
            {filters.map((item) => (
              <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>
            ))}
          </div>

          <div
            className="project-carousel"
            onMouseEnter={() => setCarouselHovered(true)}
            onMouseLeave={() => setCarouselHovered(false)}
            data-reveal
          >
            <div className="project-carousel__controls shell">
              <div className="project-carousel__status">
                <span>{String(activeProject + 1).padStart(2, '0')}</span>
                <i key={`${activeProject}-${carouselHovered}`} />
                <span>{String(filteredProjects.length).padStart(2, '0')}</span>
              </div>
              <p>{carouselHovered ? 'Navegação pausada' : 'Próximo projeto em 10s'}</p>
              <div className="project-carousel__buttons">
                <button type="button" onClick={() => goToProject(activeProject - 1)} aria-label="Projeto anterior">←</button>
                <button type="button" onClick={() => goToProject(activeProject + 1)} aria-label="Próximo projeto">→</button>
              </div>
            </div>
            <div className="project-scroll" ref={projectScrollRef}>
              <div className="project-grid">
                {filteredProjects.map((project, index) => (
                  <article className={`project-card ${index === activeProject ? 'project-card--active' : ''}`} key={project.slug}>
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
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <div className="all-projects shell" data-reveal>
            <a href="https://github.com/murilosilva100" target="_blank" rel="noreferrer">Ver perfil completo no GitHub <Arrow /></a>
          </div>
        </section>

        <section className="contact section" id="contato">
          <div className="shell contact__inner" data-reveal>
            <div className="section-index"><span>06</span><p>Vamos conversar</p></div>
            <p className="contact__kicker">Tem uma ideia, oportunidade ou apenas quer trocar uma ideia?</p>
            <h2>Vamos criar algo<br /><em>relevante</em> juntos.</h2>
            <div className="contact__channels">
              <a href="mailto:contato@murilofarias.dev">
                <span className="contact__channel-index">01</span>
                <div><small>E-mail</small><strong>contato@murilofarias.dev</strong></div>
                <Arrow />
              </a>
              <a href="https://www.linkedin.com/in/murilofariassilva" target="_blank" rel="noreferrer">
                <span className="contact__channel-index">02</span>
                <div><small>LinkedIn</small><strong>/in/murilofariassilva</strong></div>
                <Arrow />
              </a>
              <a href="https://github.com/murilosilva100" target="_blank" rel="noreferrer">
                <span className="contact__channel-index">03</span>
                <div><small>GitHub</small><strong>@murilosilva100</strong></div>
                <Arrow />
              </a>
            </div>
          </div>
          <footer className="shell footer">
            <p>© 2026 Murilo Farias Silva</p>
            <div><a href="https://github.com/murilosilva100" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/in/murilofariassilva" target="_blank" rel="noreferrer">LinkedIn</a></div>
            <a href="#top">Voltar ao topo ↑</a>
          </footer>
        </section>
      </main>
    </>
  )
}

export default App
