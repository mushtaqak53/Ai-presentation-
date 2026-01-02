
import pptxgen from "pptxgenjs";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, PageBreak } from "docx";
import saveAs from "file-saver";
import { GeneratedData, OutputType, SlideContent, DocumentSection, ThemePalette, ThemeFont } from "./types";

/**
 * Generates a professional PPTX file with high-quality layouts and styling based on selected theme.
 */
export async function downloadPPTX(data: GeneratedData, palette: ThemePalette, font: ThemeFont) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.company = "DocuGenius AI";
  pres.title = data.title;

  const COLORS = {
    PRIMARY: palette.primary,
    DARK_BG: palette.dark,
    TEXT_LIGHT: "F8FAFC",
    TEXT_DARK: "0F172A",
    ACCENT: palette.accent,
  };

  const fontFace = font.family;

  // --- 1. TITLE SLIDE ---
  const titleSlide = pres.addSlide();
  titleSlide.background = { fill: COLORS.DARK_BG };
  
  titleSlide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.1, fill: { color: COLORS.ACCENT }
  });

  titleSlide.addText(data.title.toUpperCase(), { 
    x: 0.5, y: 1.5, w: 9, 
    fontSize: 44, bold: true, color: COLORS.TEXT_LIGHT, 
    align: "center", fontFace: fontFace
  });

  if (data.subtitle || data.type) {
    titleSlide.addText(data.subtitle || "Generated Strategic Presentation", { 
      x: 1, y: 3.5, w: 8, 
      fontSize: 22, color: COLORS.ACCENT, 
      align: "center", italic: true, fontFace: fontFace
    });
  }

  titleSlide.addText("DocuGenius AI • Strategic Deck", {
    x: 1, y: 5.2, w: 8,
    fontSize: 10, color: "94A3B8",
    align: "center", bold: true, fontFace: fontFace
  });

  // --- 2. CONTENT SLIDES ---
  (data.items as SlideContent[]).forEach((item, idx) => {
    const slide = pres.addSlide();
    
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 0.15, h: "100%", fill: { color: COLORS.PRIMARY }
    });

    slide.addText(String(idx + 1).padStart(2, '0'), {
      x: 8.5, y: 0.3, w: 1, fontSize: 36, color: "F1F5F9", bold: true, align: "right", fontFace: fontFace
    });

    slide.addText(item.title, { 
      x: 0.5, y: 0.4, w: 8, 
      fontSize: 28, bold: true, color: COLORS.TEXT_DARK, 
      fontFace: fontFace
    });

    slide.addShape(pres.ShapeType.line, {
      x: 0.5, y: 1.1, w: 4, h: 0, line: { color: COLORS.PRIMARY, width: 2 }
    });
    
    const bulletPoints = item.points.map(p => ({ 
      text: p, 
      options: { 
        bullet: true, 
        color: "334155", 
        fontSize: 18,
        margin: [10, 0, 0, 0],
        fontFace: fontFace
      } 
    }));

    slide.addText(bulletPoints, { 
      x: 0.5, y: 1.6, w: 9, h: 3.5,
      valign: "top"
    });

    slide.addText(`DocuGenius AI | ${data.title}`, {
      x: 0.5, y: 5.2, w: 9, fontSize: 9, color: "94A3B8", bold: true, fontFace: fontFace
    });
  });

  pres.writeFile({ fileName: `${data.title.replace(/\s+/g, '_')}_Presentation.pptx` });
}

/**
 * Generates a professional DOCX file with a cover page and structured section layouts.
 */
export async function downloadDOCX(data: GeneratedData, palette: ThemePalette, font: ThemeFont) {
  const COLORS = {
    PRIMARY: palette.primary,
    DARK: palette.dark,
    SLATE: "64748B"
  };

  const fontFace = font.family;

  const children: any[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: "DG.",
          bold: true,
          size: 48,
          color: COLORS.PRIMARY,
          font: fontFace,
        }),
      ],
      spacing: { after: 1200 },
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.title,
          bold: true,
          size: 64, 
          color: COLORS.DARK,
          font: fontFace,
        }),
      ],
      spacing: { before: 1000, after: 400 },
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "STRATEGIC ANALYSIS & DOCUMENTATION",
          bold: true,
          size: 24,
          color: COLORS.PRIMARY,
          characterSpacing: 2,
          font: fontFace,
        }),
      ],
      spacing: { after: 2000 },
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Issued on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          size: 24,
          color: COLORS.SLATE,
          font: fontFace,
        }),
      ],
    }),

    new Paragraph({ children: [new PageBreak()] }),
  ];

  (data.items as DocumentSection[]).forEach((item, idx) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
        border: {
          bottom: { color: COLORS.PRIMARY, space: 1, style: BorderStyle.SINGLE, size: 6 }
        },
        children: [
          new TextRun({
            text: `SECTION ${idx + 1}: ${item.heading.toUpperCase()}`,
            color: COLORS.PRIMARY,
            bold: true,
            size: 28,
            font: fontFace,
          }),
        ],
        spacing: { before: 600, after: 400 },
      })
    );

    item.paragraphs.forEach(p => {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          children: [
            new TextRun({
              text: p,
              size: 24,
              color: "334155",
              font: fontFace,
            }),
          ],
          spacing: { line: 360, after: 250 },
        })
      );
    });
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${data.title.replace(/\s+/g, '_')}_Document.docx`);
}
