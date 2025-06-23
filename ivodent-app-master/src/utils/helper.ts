import { UserItem } from "@interface/context";
import { jsPDF } from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import moment from "moment";
import { seasonList } from "../pages/admin/grades";

export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const formatDate = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = date.getFullYear();

  return `${dd}.${mm}.${yyyy}`;
};

export const getYear = (date?: string): number =>
  date ? Number(date.split("-")[0]) : 0;

export const getDayDifference = (min: string, max: string) => {
  const minNum = Number(new Date(min).getTime());
  const maxNum = Number(new Date(max).getTime());
  const date2 = new Date(minNum > maxNum ? min : max);
  const date1 = new Date(minNum < maxNum ? min : max);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const generatePdfFile = ({
  image,
  season,
  students,
  date,
  course,
  subject,
  teachers,
  timeline,
  year,
}: {
  image: string | HTMLImageElement | HTMLCanvasElement | Uint8Array;
  students?: RowInput[];
  season: string;
  date: string;
  course: string;
  timeline: string;
  subject: string;
  year?: number;
  teachers: string;
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
  });

  const fileWidth = doc.internal.pageSize.getWidth();

  // doc.text("Hello world!", 10, 10);
  doc.addImage(image, "PNG", fileWidth - (fileWidth / 2 + 41 / 2), 10, 41, 22);

  const array = [
    "REPUBLIKA E SHQIPËRISË",
    "AKADEMIA IVODENT",
    "FAKULTETI I TEKNIKAVE DENTARE",
    "SEKRETARIA MËSIMORE",
  ];

  const headingFontSize: number = 12;
  let celling = 35;

  for (const text of array) {
    doc
      .setFontSize(headingFontSize)
      .setFont("times", "bold")
      .text(text, fileWidth - fileWidth / 2, celling, {
        align: "center",
      });

    celling += headingFontSize / 2;
  }

  celling += headingFontSize / 3;

  doc
    .setFontSize(headingFontSize)
    .setFont("times", "bold")
    .text("FLETË PROVIMI", 14, celling, {
      align: "left",
    });

  doc
    .setFontSize(headingFontSize)
    .setFont("times", "bold")
    .text(
      `SEZONI I ${seasonList
        .find((e) => e.key === season)
        ?.value.toUpperCase()}`,
      fileWidth - fileWidth / 2,
      celling,
      {
        align: "center",
      }
    );

  doc
    .setFontSize(headingFontSize)
    .setFont("times", "bold")
    .text(
      `DATË PROVIMI: ${moment(date).format("DD.MM.YYYY")}`,
      fileWidth - 41,
      celling,
      {
        align: "center",
      }
    );

  celling += headingFontSize / 2;

  const info = [
    `Programi i Studimit: "${course.toUpperCase()}"`,
    `Viti Akademik: ${timeline}`,
    `Lënda: ${subject}           ${subject.length < 34 ? `VITI: ${year}` : ""}`,

    ...(() => {
      if (subject.length >= 34) return [`VITI: ${year}`];

      return [];
    })(),

    ...(() => {
      if (teachers.trim()) return [`Pedagogët: ${teachers}`];

      return [];
    })(),
  ];

  for (const text of info) {
    doc
      .setFontSize(headingFontSize)
      .setFont("times", "bold")
      .text(text, 14, celling, {
        align: "left",
      });

    celling += headingFontSize / 2;
  }

  autoTable(doc, {
    head: [
      [
        {
          content: "NR",
          styles: {
            halign: "center",
          },
        },
        "EMËR",
        "ATESIA",
        "MBIEMRI",
        "NOTA",
      ],
    ],
    body: students ?? [],
    startY: celling + 0.5,
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 10,
      font: "times",
    },
  });

  for (let index = 1; index < doc.internal.pages.length; index++) {
    doc.setPage(index);
    doc.text(`${index}`, fileWidth / 2, doc.internal.pageSize.height - 10, {
      align: "center",
    });
  }

  doc.text("K/SEKRETARJA", 14, doc.internal.pageSize.height - 10, {
    align: "left",
  });

  doc.save(`${subject}.pdf`);
};
