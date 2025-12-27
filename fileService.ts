
import pptxgen from "pptxgenjs";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, PageBreak } from "docx";
import saveAs from "file-saver";
import { GeneratedData, OutputType, SlideContent, DocumentSection } from "./types";

/**
 * Generates a professional PPTX file with high-quality layouts and styling.
 */
export async function downloadPPTX(data: GeneratedData) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.company = "DocuGenius AI";
  pres.title = data.title;

  // Define Branding Colors
  const COLORS = {
    PRIMARY: "4F46E5", // Indigo 600
    DARK_BG: "1E1B4B", // Indigo 950
    TEXT_LIGHT: "F8FAFC",
    TEXT_DARK: "0F172A",
    ACCENT: "818CF8",
  };

  // --- 1. TITLE SLIDE ---
  const titleSlide = pres.addSlide();
  // Deep Background
  titleSlide.background = { fill: COLORS.DARK_BG };
  
  // Decorative Shape
  titleSlide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.1, fill: { color: COLORS.ACCENT }
  });

  titleSlide.addText(data.title.toUpperCase(), { 
    x: 0.5, y: 1.5, w: 9, 
    fontSize: 48, bold: true, color: COLORS.TEXT_LIGHT, 
    align: "center", fontFace: "Arial Black"
  });

  if (data.subtitle || data.type) {
    titleSlide.addText(data.subtitle || "Generated Strategic Presentation", { 
      x: 1, y: 3.5, w: 8, 
      fontSize: 24, color: COLORS.ACCENT, 
      align: "center", italic: true 
    });
  }

  titleSlide.addText("DocuGenius AI • Strategic Deck", {
    x: 1, y: 5, w: 8,
    fontSize: 12, color: "64748B",
    align: "center", bold: true
  });

  // --- 2. CONTENT SLIDES ---
  (data.items as SlideContent[]).forEach((item, idx) => {
    const slide = pres.addSlide();
    
    // Sidebar Decoration
    slide.addShape(pres.ShapeType.rect, {
      x: 0, y: 0, w: 0.15, h: "100%", fill: { color: COLORS.PRIMARY }
    });

    // Page Number
    slide.addText(String(idx + 1).padStart(2, '0'), {
      x: 8.5, y: 0.3, w: 1, fontSize: 40, color: "F1F5F9", bold: true, align: "right"
    });

    // Heading
    slide.addText(item.title, { 
      x: 0.5, y: 0.4, w: 8, 
      fontSize: 32, bold: true, color: COLORS.TEXT_DARK, 
      fontFace: "Arial"
    });

    // Divider line
    slide.addShape(pres.ShapeType.line, {
      x: 0.5, y: 1.1, w: 4, h: 0, line: { color: COLORS.PRIMARY, width: 2 }
    });
    
    // Bullet Points
    const bulletPoints = item.points.map(p => ({ 
      text: p, 
      options: { 
        bullet: true, 
        color: "334155", 
        fontSize: 20,
        margin: [10, 0, 0, 0]
      } 
    }));

    slide.addText(bulletPoints, { 
      x: 0.5, y: 1.6, w: 9, h: 3.5,
      valign: "top"
    });

    // Footer
    slide.addText(`DocuGenius AI | ${data.title}`, {
      x: 0.5, y: 5.2, w: 9, fontSize: 10, color: "94A3B8", bold: true
    });
  });

  pres.writeFile({ fileName: `${data.title.replace(/\s+/g, '_')}_Presentation.pptx` });
}

/**
 * Generates a professional DOCX file with a cover page and structured section layouts.
 */
export async function downloadDOCX(data: GeneratedData) {
  const COLORS = {
    PRIMARY: "4F46E5",
    DARK: "1E293B",
    SLATE: "64748B"
  };

  // --- COVER PAGE ---
  const children: any[] = [
    // Branding
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: "DG.",
          bold: true,
          size: 48,
          color: COLORS.PRIMARY,
        }),
      ],
      spacing: { after: 1200 },
    }),

    // Document Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: data.title,
          bold: true,
          size: 72, // 36pt
          color: COLORS.DARK,
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
        }),
      ],
      spacing: { after: 2000 },
    }),

    // Date and Footer of Cover
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Issued on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
          size: 24,
          color: COLORS.SLATE,
        }),
      ],
    }),

    new Paragraph({ children: [new PageBreak()] }),
  ];

  // --- CONTENT SECTIONS ---
  (data.items as DocumentSection[]).forEach((item, idx) => {
    // Section Header
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
          }),
        ],
        spacing: { before: 600, after: 400 },
      })
    );

    // Paragraphs
    item.paragraphs.forEach(p => {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFY,
          children: [
            new TextRun({
              text: p,
              size: 24, // 12pt
              color: "334155",
            }),
          ],
          spacing: { line: 360, after: 250 }, // 1.5 line spacing
        })
      );
    });
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch
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
