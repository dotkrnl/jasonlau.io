#let data = json("data.json")

#set document(title: "Jason Lau - CV", author: data.name)
#set page(margin: (x: 0.7in, y: 0.6in), paper: "us-letter", numbering: "1")
#set text(font: "Libertinus Serif", size: 10pt)
#set par(justify: true, leading: 0.65em)

// Helpers
#let section-heading(title) = {
  block(above: 32pt, below: 0pt, sticky: true)[
    #text(size: 9pt, weight: "bold", tracking: 0.15em, upper(title))
    #line(length: 100%, stroke: 0.5pt + luma(180))
    #v(10pt)
  ]
}

#let entry(l, r) = {
  grid(
    columns: (1fr, auto),
    column-gutter: 8pt,
    l, text(size: 9pt, fill: luma(100), r),
  )
}

// Header
#align(center)[
  #text(size: 20pt, weight: "bold", data.name)
  #v(-4pt)
  #text(size: 9pt, fill: luma(80))[
    #data.phone #h(6pt) | #h(6pt) #data.email #h(6pt) | #h(6pt) #data.github
  ]
]

// Education
#section-heading("Education")

#for (i, edu) in data.education.enumerate() {
  entry(
    [*#edu.degree* --- #edu.school],
    edu.time,
  )
  if edu.at("details", default: none) != none {
    for detail in edu.details {
      text(size: 9pt, fill: luma(80), detail)
      linebreak()
    }
  }
  if i < data.education.len() - 1 { v(3pt) }
}

// Experience
#section-heading("Professional Experience")

#for (i, exp) in data.experience.enumerate() {
  block(breakable: false)[
    #entry(
      [*#exp.title* --- #exp.org],
      [#exp.time #if exp.at("location", default: none) != none { [ | #exp.location] }],
    )
    #v(1pt)
    #text(size: 9pt, exp.desc)
  ]
  if i < data.experience.len() - 1 { v(5pt) }
}

// Publications
#section-heading("Publications")
#text(size: 8pt, fill: luma(100))[\* indicates co-first authors]
#v(2pt)

#for (i, pub) in data.publications.enumerate() {
  block(breakable: false)[
    #grid(
      columns: (1fr, auto),
      column-gutter: 8pt,
      text(weight: "bold", size: 9.5pt, pub.title),
      if pub.year != "" { align(right, text(size: 9pt, fill: luma(100), pub.year)) },
    )
    #text(size: 9pt, fill: luma(60), pub.authors)
    #linebreak()
    #text(size: 8.5pt, fill: luma(100), style: "italic", pub.venue)
  ]
  if i < data.publications.len() - 1 { v(4pt) }
}

// Projects
#section-heading("Key Engineering & Systems Projects")

#for (i, proj) in data.projects.enumerate() {
  block(breakable: false)[
    *#proj.title* --- #text(size: 9pt, weight: "bold", proj.role)
    #linebreak()
    #text(size: 9pt, proj.desc)
  ]
  if i < data.projects.len() - 1 { v(4pt) }
}

// Technical Skills
#section-heading("Technical Skills")

#for skill in data.skills {
  [*#skill.category:* #text(size: 9pt, skill.items)]
  linebreak()
}

// Awards
#section-heading("Selected Awards")

#set list(spacing: 0.5em)
#block(breakable: false)[
  #for award in data.awards {
    entry(
      [*#award.name*],
      text(size: 9pt, award.org),
    )
  }
]

// Services
#section-heading("Services")

#for svc in data.services {
  [- *#svc.role* of #svc.event]
}

// Reviews
#v(2pt)
#section-heading("Reviews")

Reviewed *#str(data.reviews.count) papers* (excluding subreviews) for:

#for journal in data.reviews.journals {
  [- #text(size: 9pt, journal)]
}
