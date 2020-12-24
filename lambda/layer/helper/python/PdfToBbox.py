import pdfplumber
import os
import json
from decimal import Decimal


class Pdf:
    def __init__(self, pdf_path, json_output_path, y_tolerance=3):
        self.parser: PdfBboxLineParser = PdfBboxLineParser(pdf_path, y_tolerance)
        self.json_folder_path, self.json_name = os.path.split(json_output_path)
        self.pages: [PdfPage] = []

    def parse_pdf(self):
        self.pages = self.parser.parse_pdf_file()

    def dump_pdf(self):
        for page in self.pages:
            page.dump_pdf_page()

    def save_in_json(self):
        pdf_pages = []
        json_path = os.path.join(self.json_folder_path, self.json_name)
        for page in self.pages:
            pdf_pages.append(page.get_page_in_json())
        pdf_json = json.dumps(pdf_pages, indent=4, ensure_ascii=False)
        with open(json_path, "w", encoding='utf-8') as json_file:
            json_file.write(pdf_json)


class PdfPage:
    def __init__(self, page_nb):
        self.pdf_lines: [PdfLine] = []
        self.page_nb = page_nb

    def add_line(self, pdf_plumber_line: [dict]):
        pdf_line = PdfLine()
        pdf_line.convert_line(pdf_plumber_line)
        self.pdf_lines.append(pdf_line)

    def get_page_in_json(self):
        json_pdf_line = []
        for line in self.pdf_lines:
            json_pdf_line.append(line.get_line_in_json())
        return {
            "page_number": self.page_nb,
            "page_content": json_pdf_line
        }

    def dump_pdf_page(self):
        print("=========== Page {} ===========".format(self.page_nb))
        for line in self.pdf_lines:
            line.dump_pdf_line()


class PdfBboxLineParser:
    def __init__(self, pdf_path, y_tolerance):
        # folder_path = "path/to/folder" / pdf_file_name = "pdf_name.pdf"
        self.folder_path, self.pdf_file_name = os.path.split(pdf_path)
        self.y_tolerance = y_tolerance

    def parse_pdf_file(self) -> [PdfPage]:
        pdf_path = os.path.join(self.folder_path, self.pdf_file_name)
        index = 1
        pdf_pages: [PdfPage] = []

        with pdfplumber.open(pdf_path) as pdf_file:
            for page in pdf_file.pages:
                page_words = page.extract_words(x_tolerance=3, y_tolerance=3, keep_blank_chars=False,
                                                use_text_flow=False, horizontal_ltr=True, vertical_ttb=True,
                                                extra_attrs=[])
                pdf_pages.append(self.extract_page_lines(page_words, index))
                index += 1
        return pdf_pages

    def is_same_line(self, line_top: Decimal, line_bot: Decimal, current_top: Decimal, current_bot: Decimal) -> bool:
        top_diff = line_top - current_top
        bot_diff = line_bot - current_bot
        if not -self.y_tolerance < top_diff < self.y_tolerance:
            return False
        if not -self.y_tolerance < bot_diff < self.y_tolerance:
            return False
        return True

    def extract_page_lines(self, extracted_words, nb_page) -> [PdfPage]:
        index = 0
        pdf_words_line = []
        pdf_page: PdfPage = PdfPage(nb_page)

        if len(extracted_words) == 0 or len(extracted_words) == 1:
            return [extracted_words]
        line_top = extracted_words[index].get("top")
        line_bot = extracted_words[index].get("bottom")
        while index < len(extracted_words):
            if (self.is_same_line(line_top, line_bot, extracted_words[index].get("top"), extracted_words[index].get(
                    "bottom")) is True):
                pdf_words_line.append(extracted_words[index])
            else:
                line_top = extracted_words[index].get("top")
                line_bot = extracted_words[index].get("bottom")
                pdf_page.add_line(pdf_words_line)
                pdf_words_line = [extracted_words[index]]
            index += 1
        # Create the last line of the page
        pdf_page.add_line(pdf_words_line)
        return pdf_page


class PdfLine:
    def __init__(self):
        self.line = ""
        self.size = len(self.line)
        self.x0 = 0
        self.x1 = 0
        self.y0 = 0
        self.y1 = 0

    def convert_line(self, words: [dict]):
        nb_word = len(words)
        if nb_word != 0:
            self.x0 = float(words[0].get('x0'))
            self.y0 = float(words[0].get('top'))
            for word in words:
                self.line += "{} ".format(word.get("text"))
            self.size = len(self.line)
            self.x1 = float(words[nb_word - 1].get('x1'))
            self.y1 = float(words[nb_word - 1].get('bottom'))

    def get_line_in_json(self):
        return {
            "text": self.line,
            "size": self.size,
            "x0": self.x0,
            "x1": self.x1,
            "top": self.y0,
            "bottom": self.y1,
        }

    def dump_pdf_line(self):
        print("[Line] {}".format(self.line))
        print("[Size] {}".format(self.size))
        print("[x0] {}".format(self.x0))
        print("[x1] {}".format(self.x1))
        print("[y0] {}".format(self.y0))
        print("[y1] {}\n".format(self.y1))