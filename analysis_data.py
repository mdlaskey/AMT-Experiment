import numpy as np
import matplotlib.pyplot as plt
import cPickle as pickle
import IPython 

#Measure how many timesteps until the best control
def costFunction(controls):
	intrvl = 45
	cost = -1
	sec_cost = -1
	# print "CONTROLS LENGTH ", len(controls)
	if(len(controls)< intrvl):
		return 2*intrvl
	for i in range(intrvl):
		if(controls[i][1] == -1):
			cost = i
			break; 
	# print "CONTROLS ", controls
	# print "COST ", cost
	if(cost == -1):
		cost = intrvl

	for i in range(intrvl-1,len(controls)):
		if(controls[i][1] == 1):
			sec_cost = i
			break; 
	# print "SEC COST ", sec_cost
	if(sec_cost == -1): 
		sec_cost = intrvl

	return sec_cost+cost

def getPerfLearning(subjects):
	if(len(subjects) == 0):
		return -1

	num_subjs = len(subjects)
	perfs = np.zeros([num_subjs,5])
	avg_perfs = []
	missing = 0

	for j in range(num_subjs):
		if(len(subjects[j][2]) != 7):
			missing += 1
		else:
			for i in range(1,6):
				costs = costFunction(subjects[j][2][i][1])
				
				# costs = np.asarray(costs)
				perfs[j,i-1] = costs

	for i in range(5):
		sum_perf = np.sum(perfs[:,i])
		avg_perfs.append(sum_perf/(num_subjs-missing))


	return avg_perfs

def getPerfLearned(subjects):
	if(len(subjects) == 0):
		return -1

	missing = 0
	num_subjs = len(subjects)
	perfs = np.zeros(num_subjs)
	avg_perf = 0
	

	for j in range(num_subjs):
		if(len(subjects[j][2]) != 7):
			missing += 1
		else:
			costs = costFunction(subjects[j][2][6][1])
			
			perfs[j] = costs

	avg_perf = np.sum(perfs)/(num_subjs-missing)


	return avg_perf




if __name__ == '__main__':

	AllData = pickle.load(open('AllData.p','rb'))
	

	#First sort by conditons 
	no_coach = []
	learning_coach = []
	expert_coach = []
	for key in AllData:
		if(AllData[key][0] == '0'):
			no_coach.append(AllData[key])
		elif(AllData[key][0] == '1'): 
			learning_coach.append(AllData[key])
		else: 
			expert_coach.append(AllData[key])

	print "--------SUBJECTS IN CONDITIONS-------"
	print "No Coach ",len(no_coach)
	print "Learning Coach ",len(learning_coach)
	print "Expert Coach ", len(expert_coach)

	
	print "-----------DURING LEARNING-----------"
	print "Average Cost w/ No ",getPerfLearning(no_coach)
	print "Average Cost w/ Learning Robot ",getPerfLearning(learning_coach)
	print "Average Cost w/ Expert ",getPerfLearning(expert_coach)

	print "-----------AFTER LEARNING-----------"
	print "Average Cost w/ No ",getPerfLearned(no_coach)
	print "Average Cost w/ Learning Robot ",getPerfLearned(learning_coach)
	print "Average Cost w/ Expert ",getPerfLearned(expert_coach)