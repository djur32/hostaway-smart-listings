// Join PDFs with macOS's own PDFKit, for machines without pdfunite.
//   osascript -l JavaScript tools/lib/pdf-join.js out.pdf a.pdf b.pdf …
// Pages are copied as they are (still vector).
ObjC.import('Foundation');
ObjC.import('PDFKit');

function run(argv) {
  const [out, ...ins] = argv;
  if (!out || !ins.length) throw new Error('usage: pdf-join.js out.pdf in1.pdf [in2.pdf …]');
  const doc = $.PDFDocument.alloc.init;
  for (const f of ins) {
    const src = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(f));
    if (!src || src.isNil()) throw new Error('cannot read ' + f);
    for (let i = 0; i < src.pageCount; i++) doc.insertPageAtIndex(src.pageAtIndex(i), doc.pageCount);
  }
  if (!doc.writeToFile(out)) throw new Error('cannot write ' + out);
  return out + ' · ' + doc.pageCount + ' pages';
}
