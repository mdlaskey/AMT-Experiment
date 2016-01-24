import numpy as np
import matplotlib.pyplot as plt
import cPickle as pickle
import IPython 



def calSubj(subjects,coach = False):
	score = []
	if(coach):
		length = 14
		all_rsp = np.zeros([len(subjects),length])
	else: 
		length = 3
		all_rsp = np.zeros([len(subjects),length])
		

	for i in range(len(subjects)):
		responses = subjects[i][1]['undefined']
		for t in range(length):
			all_rsp[i,t] = float(responses[t+3])

	for i in range(length):
		score.append(np.sum(all_rsp[:,i])/len(subjects))

	print "Driving on the black ice was challenging in the beginning. ", score[0]
	print "Driving on the black ice was challenging at the end. ", score[1]
	print "I learned to drive better over the black ice. ", score[2]
	if(coach):
		print "The robotic coach gave informative feedback. ", score[3]
		print "The robotic coach was intelligent. ", score[4]
		print "I am confident in the robotic coaches ability to help me. ", score[5]
		print "The robot was trustworthy. ", score[6]
		print "I feel uncomfortable with the robotic coach. ", score[7]
		print "The robotic coach and I understand each other. ", score[8]
		print "The robotic coach perceived accurately what my goal was ", score[9]
		print "The robotic coach did not understand what I am trying to accomplish. ", score[10]
		print "The robot coach and I were working towards mutually agreed upon goals. ", score[11]
		print "I found the robotic coach's advice confusing. ", score[12]
		print "The robotic coach's advice improved over time.", score[13]


def checkExploration(subject):
	count_tr = 0
	for i in range(1,6):
		controls = subject[i][1] 
		little_count = 0
		for t in range(len(controls)):
			
			if(controls[t][1] != 0):
				count_tr += 1
				little_count += 1 
	

	return count_tr > 0


#Measure how many timesteps until the best control
def costFunction(controls):
	intrvl = 60
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
	if(sec_cost == -1 or sec_cost > intrvl): 
		sec_cost = intrvl


	return sec_cost+cost

def getPerfLearning(subjects,rm_lazy=False):
	if(len(subjects) == 0):
		return -1

	num_subjs = len(subjects)
	perfs = np.zeros([num_subjs,5])
	adpt_missing = np.zeros(5)
	avg_perfs = []
	missing = 0

	for j in range(num_subjs):
		if(len(subjects[j][2]) != 7 or not checkExploration(subjects[j][2])):
			#print "MISING\n"
			missing += 1
		else:
			for i in range(1,6):
				
				costs = costFunction(subjects[j][2][i][1])
				if(i > 1):
					if(j>15 and rm_lazy):
						costs = 0
						adpt_missing[i-1] += 1
					
				costs = np.asarray(costs)
				perfs[j,i-1] = costs
	error_perfs = []
	for i in range(5):
		sum_perf = np.sum(perfs[:,i])
		x = perfs[:,i]
		error_perfs.append(np.std(x[x!=0])/5.65)
		avg_perfs.append(sum_perf/(num_subjs-missing - adpt_missing[i]))
	

	
	return avg_perfs, error_perfs

def getPerfLearned(subjects,rm_lazy=False):
	if(len(subjects) == 0):
		return -1

	missing = 0
	adpt_missing = 0
	num_subjs = len(subjects)
	perfs = np.zeros(num_subjs)
	avg_perf = 0
	

	for j in range(num_subjs):
		if(len(subjects[j][2]) != 7 or not checkExploration(subjects[j][2])):
			missing += 1
		else:
			costs = costFunction(subjects[j][2][6][1])
			if(j> 15 and rm_lazy):
				costs = 0
				adpt_missing += 1
			
			perfs[j] = costs

	avg_perf = np.sum(perfs)/(num_subjs-missing-adpt_missing)


	return avg_perf




if __name__ == '__main__':

	AllData = pickle.load(open('AllData_1_14_16.p','rb'))
	
	x = [1,2,3,4,5]
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
	[no_coach_l,error_no] = getPerfLearning(no_coach)
	[learning_coach_l,error_learning] = getPerfLearning(learning_coach)
	[expert_coach_l,error_expert] = getPerfLearning(expert_coach,rm_lazy=True)
	print "Average Cost w/ No ",getPerfLearning(no_coach)
	print "Average Cost w/ Learning Robot ",getPerfLearning(learning_coach)
	print "Average Cost w/ Expert ",getPerfLearning(expert_coach,rm_lazy=True)
	plt.errorbar(x,no_coach_l,yerr = error_no,linewidth=3.0)
	plt.errorbar(x,learning_coach_l, yerr = error_learning,linewidth=3.0)
	plt.errorbar(x,expert_coach_l, yerr = error_expert,linewidth=3.0)
	q_l = [97, 80.0, 72.200000000000003, 65.799999999999997, 66.399999999999999]
	error_q = [2.8, 0.1, 0.5, 0.2, 0.14]

	# qh_l = [118, 115, 116, 110, 107]
	# error_qh = [3.2, 0.2, 1.0, 0.5, 0.34]

	qq_l = [114, 112, 101, 115, 103]
	error_qq = [4.2, 4.3, 3.1, 5.2, 4.14]
	plt.errorbar(x,q_l, yerr = error_q,linewidth=3.0)
	#plt.errorbar(x,qh_l, yerr = error_qh,linewidth=3.0)
	plt.errorbar(x,qq_l, yerr = error_qq,linewidth=3.0)
	plt.ylabel('Cost Incurred')
	plt.xlabel('Trials')
	names = ['No Coach','Learning Coah','Expert Coach','Q', 'Q_H']
	plt.legend(names,loc='lower left')


	plt.show()

	print "-----------AFTER LEARNING-----------"
	print "Average Cost w/ No ",getPerfLearned(no_coach)
	print "Average Cost w/ Learning Robot ",getPerfLearned(learning_coach)
	print "Average Cost w/ Expert ",getPerfLearned(expert_coach,rm_lazy = True)



	print "-------------SUBJECTIVE RESPONSES----------"
	print "-------------------------------------------"
	print "-------------------NO COACH----------------"
	calSubj(no_coach)
	print "-------------------------------------------"
	print "----------------LEARNING COACH-------------"
	calSubj(learning_coach, coach = True)
	print "-------------------------------------------"
	print "----------------EXPERT COACH-------------"
	calSubj(expert_coach, coach = True)

