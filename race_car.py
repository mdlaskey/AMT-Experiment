# this file imports custom routes into the experiment server
import sys

sys.path.append('/Users/michaelluskey/Documents/RL/LFD/lapmaster1.1/')
#sys.path.append('/home/laskeymd/RL')


import IPython 
import cv2 
import numpy as np
from PIL import Image


import cPickle as pickle
from flask import Blueprint, render_template, request, jsonify, Response, abort, current_app,make_response
from jinja2 import TemplateNotFound
from flask import Flask
from flask.ext.jsonpify import jsonify
from functools import wraps,update_wrapper
from sqlalchemy import or_

from psiturk.psiturk_config import PsiturkConfig
from psiturk.experiment_errors import ExperimentError
from psiturk.user_utils import PsiTurkAuthorization, nocache
from datetime import timedelta

# # Database setup
from psiturk.db import db_session, init_db
from Classes.Supervisor import Supervisor 
from Classes.RobotCont import RobotCont
from Classes.RobotQ import RobotQ
from psiturk.models import Participant
from json import dumps, loads
from cStringIO import StringIO
# load the configuration options
config = PsiturkConfig()
config.load_config()
myauth = PsiTurkAuthorization(config)  # if you want to add a password protect route use this

#
# explore the Blueprint
custom_code = Blueprint('custom_code', __name__, template_folder='templates', static_folder='static')
custom_code = Flask(__name__)
custom_code.config['PROPAGATE_EXCEPTIONS'] = True

QLearning = True

AllData = dict()
CurrentData = dict()
CumData = dict()
Coaches = dict()

supervisor = Supervisor()

#rc = pickle.load(open('/Users/michaelluskey/Documents/RL/LFD/AMT_Experiment/RoboCont.p'))

def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator




@custom_code.route('/get_help')
@crossdomain(origin='*')
def get_video():

	#Sort Data
	data = dict(request.args)

	key = data['undefined'][0]
	state = np.array(data['undefined'][1:5], dtype=float)
	control = np.array(data['undefined'][5:7], dtype=float)

	#Get reward
	r = supervisor.getCost(state)

	#save data
	if not (key in CurrentData):
		CurrentData[key] = [[state],[control],[r]]
	else:
		CurrentData[key][0].append(state)
		CurrentData[key][1].append(control)
		CurrentData[key][2].append(r)

	return jsonify(result={"status": 200})


	




if __name__ == '__main__':
	print "running"
	video_lst = []
	for i in range(1254):
		video = "Video_Example/img_+"i+".jpg"
		img = cv2.imread(video)
		video_lst.append(img)

	IPython.embed()
	custom_code.run(host='0.0.0.0')
