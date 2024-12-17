from flask import Blueprint, render_template, url_for
from flask import current_app
from os import path
import requests

main = Blueprint('main', __name__)

@main.route('/')
def index():
    whitePawnImage = url_for('static', filename='images/pawn-white.svg')
    whiteKingImage = url_for('static', filename='images/king-white.svg')
    whiteQueenImage = url_for('static', filename='images/queen-white.svg')
    whiteBishopImage = url_for('static', filename='images/bishop-white.svg')
    whiteKnightImage = url_for('static', filename='images/knight-white.svg')
    whiteRookImage = url_for('static', filename='images/rook-white.svg')
    blackPawnImage = url_for('static', filename='images/pawn-black.svg')
    blackKingImage = url_for('static', filename='images/king-black.svg')
    blackQueenImage = url_for('static', filename='images/queen-black.svg')
    blackBishopImage = url_for('static', filename='images/bishop-black.svg')
    blackKnightImage = url_for('static', filename='images/knight-black.svg')
    blackRookImage = url_for('static', filename='images/rook-black.svg')

    return render_template('index.html',whitePawnImage=whitePawnImage,
                           whiteKingImage=whiteKingImage,
                           whiteQueenImage=whiteQueenImage,
                           whiteBishopImage=whiteBishopImage,
                           whiteKnightImage=whiteKnightImage,
                           whiteRookImage=whiteRookImage,
                           blackPawnImage=blackPawnImage,
                           blackKingImage=blackKingImage,
                           blackQueenImage=blackQueenImage,
                           blackBishopImage=blackBishopImage,
                           blackKnightImage=blackKnightImage,
                           blackRookImage=blackRookImage,)