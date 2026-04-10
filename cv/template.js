"use strict";

/**
 * Escape LaTeX special characters in a string.
 */
function esc(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[\\&%$#_{}~^]/g, (ch) => {
    switch (ch) {
      case "\\": return "\\textbackslash{}";
      case "{":  return "\\{";
      case "}":  return "\\}";
      case "~":  return "\\textasciitilde{}";
      case "^":  return "\\textasciicircum{}";
      default:   return "\\" + ch;
    }
  });
}

/**
 * Split "2018 – 2024，GPA 4.0/4.0" into { dates, extra }.
 */
function splitTimeField(time) {
  const match = time.match(/^(.+?)[，,]\s*(.+)$/);
  if (match) return { dates: match[1].trim(), extra: match[2].trim() };
  return { dates: time, extra: "" };
}

/**
 * Generate a Classicthesis-styled CV using currvita.
 * classicthesis provides: TeX Gyre Pagella, old-style figures, true small caps,
 * \spacedallcaps, \spacedlowsmallcaps, Maroon accent color.
 */
function generateTeX(data) {
  const isCn = data.locale === "cn";
  const L = [];
  const w = (s) => L.push(s);

  // Label widths per section type
  const lw = isCn
    ? { edu: "3cm", exp: "4.5cm", pub: "1.5cm", skills: "2.5cm", none: "0.1cm" }
    : { edu: "3.5cm", exp: "4.5cm", pub: "1.5cm", skills: "4cm", none: "0.1cm" };

  // ── Preamble ──────────────────────────────────────────────
  w("\\documentclass[10pt,letterpaper]{scrartcl}");
  w("\\usepackage[nochapters,palatino=false]{classicthesis}");
  w("\\usepackage[LabelsAligned,NoDate]{currvita}");
  w("");
  w("% Fonts: Palatino manually (palatino=false avoids unicode-math breaking xeCJK bold)");
  w("\\usepackage{xeCJK}");
  w("\\setCJKmainfont{Songti SC}");
  w("\\newCJKfontfamily\\heiti[RawFeature={embolden=3}]{Heiti SC}");
  w("\\let\\origbfseries\\bfseries");
  w("\\renewcommand{\\bfseries}{\\origbfseries\\heiti}");
  w("\\let\\origtextbf\\textbf");
  w("\\renewcommand{\\textbf}[1]{{\\origbfseries\\heiti #1}}");
  w("\\setmainfont{texgyrepagella}[Extension=.otf,UprightFont=*-regular,");
  w("  BoldFont=*-bold,ItalicFont=*-italic,BoldItalicFont=*-bolditalic,");
  w("  Ligatures=TeX,Numbers=OldStyle]");
  w("\\linespread{1.05}");
  w("");
  w("% Layout");
  w("\\areaset[current]{420pt}{700pt}");
  w("\\pagestyle{plain}");
  w("");
  w("% currvita overrides for classicthesis look");
  w("\\renewcommand{\\cvheadingfont}{\\LARGE}");
  w("\\renewcommand{\\cvlistheadingfont}{\\large}");
  w("\\renewcommand{\\cvlabelfont}{\\small}");
  w("");
  w("\\hypersetup{colorlinks,breaklinks,urlcolor=Maroon,linkcolor=Maroon}");
  w("");
  w("\\begin{document}");
  w(`\\begin{cv}{\\spacedallcaps{${esc(data.name)}}}`);
  w("");

  // ── Contact info ──────────────────────────────────────────
  w("\\vspace{0.5em}");
  w("\\begin{center}");
  w(
    `{\\small ${esc(data.phone)} \\quad|\\quad ${esc(data.email)} \\quad|\\quad ${esc(data.github)}}`,
  );
  w("\\end{center}");
  w("\\vspace{0.5em}");
  w("");

  // ── Education ─────────────────────────────────────────────
  w(`\\setlength{\\cvlabelwidth}{${lw.edu}}`);
  w(
    `\\begin{cvlist}{\\spacedlowsmallcaps{${esc(data.meta.educationHeading)}}}`,
  );
  data.education.forEach((edu) => {
    const { dates, extra } = splitTimeField(edu.time);
    let content = `${esc(edu.degree)}, ${esc(edu.school)}`;
    if (extra) content += `, ${esc(extra)}`;
    if (edu.details && edu.details.length > 0) {
      content += `\\\\\n{\\small ${edu.details.map(esc).join("; ")}}`;
    }
    w(`\\item[${esc(dates)}] ${content}`);
  });
  w("\\end{cvlist}");
  w("");

  // ── Professional Experience ───────────────────────────────
  w(`\\setlength{\\cvlabelwidth}{${lw.exp}}`);
  w(
    `\\begin{cvlist}{\\spacedlowsmallcaps{${esc(data.meta.professionalExperienceHeading)}}}`,
  );
  data.experience.forEach((exp) => {
    const loc = exp.location ? `, ${esc(exp.location)}` : "";
    w(
      `\\item[${esc(exp.time)}] \\textbf{${esc(exp.title)}}, ${esc(exp.org)}${loc}\\\\`,
    );
    w(`{\\small ${esc(exp.desc)}}`);
  });
  w("\\end{cvlist}");
  w("");

  // ── Publications ──────────────────────────────────────────
  w(`\\setlength{\\cvlabelwidth}{${lw.pub}}`);
  w(
    `\\begin{cvlist}{\\spacedlowsmallcaps{${esc(data.meta.publicationsHeading)}}}`,
  );
  w(`\\item[] {\\small ${esc(data.meta.coFirstAuthorsNote)}}`);
  w("");
  data.publications.forEach((pub) => {
    let titleLine;
    if (pub.hasTranslation && isCn) {
      titleLine = `\\textbf{${esc(pub.titleCn)}}（中文翻译）`;
    } else {
      titleLine = `\\textbf{${esc(pub.title)}}`;
    }
    let content = titleLine;
    if (pub.titleEn) {
      content += `\\\\\n${esc(pub.titleEn)}`;
    }
    content += `\\\\\n{\\small ${esc(pub.authors)}}`;
    content += `\\\\\n{\\small\\textit{${esc(pub.venue)}}}`;
    w(`\\item[${esc(pub.year)}] ${content}`);
  });
  w("\\end{cvlist}");
  w("");

  // ── Projects ──────────────────────────────────────────────
  if (data.projects && data.projects.length > 0) {
    w(`\\setlength{\\cvlabelwidth}{${lw.none}}`);
    w(
      `\\begin{cvlist}{\\spacedlowsmallcaps{${esc(data.meta.projectsHeading)}}}`,
    );
    data.projects.forEach((proj) => {
      w(
        `\\item[] \\textbf{${esc(proj.title)}} --- ${esc(proj.role)}\\\\\n{\\small ${esc(proj.desc)}}`,
      );
    });
    w("\\end{cvlist}");
    w("");
  }

  // ── Technical Skills ──────────────────────────────────────
  if (data.skills && data.skills.length > 0) {
    w(`\\setlength{\\cvlabelwidth}{${lw.skills}}`);
    w(
      `\\begin{cvlist}{\\spacedlowsmallcaps{${esc(data.meta.technicalSkillsHeading)}}}`,
    );
    data.skills.forEach((s) => {
      w(`\\item[${esc(s.category)}] ${esc(s.items)}`);
    });
    w("\\end{cvlist}");
    w("");
  }

  // ── Awards ────────────────────────────────────────────────
  w(`\\setlength{\\cvlabelwidth}{${lw.none}}`);
  w(
    `\\begin{cvlist}{\\spacedlowsmallcaps{${esc(data.meta.selectedAwardsHeading)}}}`,
  );
  data.awards.forEach((a) => {
    w(`\\item[] \\textbf{${esc(a.name)}} \\hfill ${esc(a.org)}`);
  });
  w("\\end{cvlist}");
  w("");

  // ── Services ──────────────────────────────────────────────
  w(`\\begin{cvlist}{\\spacedlowsmallcaps{${esc(data.meta.servicesHeading)}}}`);
  data.services.forEach((svc) => {
    w(
      `\\item[] \\textbf{${esc(svc.role)}}${esc(data.labels.serviceConnector)}${esc(svc.event)}`,
    );
  });
  w("\\end{cvlist}");
  w("");

  // ── Reviews ───────────────────────────────────────────────
  w(
    `\\begin{cvlist}{\\spacedlowsmallcaps{${esc(data.meta.reviewsHeading)}}}`,
  );
  w(`\\item[] ${esc(data.labels.reviewsLeadIn)}`);
  data.reviews.journals.forEach((j) => {
    w(`\\item[] ${esc(j)}`);
  });
  w("\\end{cvlist}");

  w("");
  w("\\end{cv}");
  w("\\end{document}");

  return L.join("\n");
}

module.exports = { generateTeX };
