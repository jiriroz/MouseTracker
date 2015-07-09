"""
Analyze mouse trajectory data.
python analyze.py siteImage *options
siteImage - image of the website to draw the visualization on
*options:
-c - show clicks
-m - show moves
-im - show interest map
-ip - show interest points
-sm - show stress map
-sg - show stress graph
-all - compute the features for all sessions
id=num - compute features for a particular ID. Can choose multiple IDs.
"""

import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import matplotlib.cm as cm
import numpy as np
from PIL import Image
import csv
import sys
import random

"""
Main program. Requires file log.csv and 
for certain visualizations file site.png.
"""
def visualize():
    datafile = "log.csv"
    imfile = "site.png"
    comdOptions = sys.argv[1:]
    optionsMap = {'-c':'clicks','-m':'moves','-im':'intrmap',
                  '-ip':'intrpts','-all':'compall','-sm':'stressMap',
                  '-sg':'stressGraph'}
    options = {optionsMap[key]:(key in comdOptions) for key in optionsMap}
    myIDs = []
    for opt in comdOptions:
        keyval = opt.split("=")
        if keyval[0] == 'id':
            myIDs.append(int(keyval[1]))

    image = mpimg.imread(imfile)
    width, height = len(image[0]), len(image)
    dx, dy = 10, 10 #spacing of the heatmap

    showMainFig = any([options[key] for key in options
                      if key != 'stressGraph'])
    data = loadData(datafile)
    keys = data.keys()

    if showMainFig:
        fig = plt.figure()
        sub = fig.add_subplot(1,1,1)
        plt.axis('off')
        sub.imshow(image)

    #IDs to compute the features
    ids = [keys[4]]
    if len(myIDs) > 0:
        ids = myIDs
    if options['compall']:
        ids = keys
    if options['clicks']:
        showClicks(data, ids, sub)
    if options['moves']:
        showMoves(data, ids, sub)
    if options['intrmap'] or options['intrpts']:
        heatmap = computeInterestMap(data, ids, width, height, dx, dy)
    if options['intrmap']:
        showInterestMap(sub, heatmap, width, height)
    if options['intrpts']:
        showInterestPoints(sub, heatmap, dx, dy)
    if options['stressMap']:
        showStressMap()
    if options['stressGraph']:
        showStressGraph()
    if showMainFig:
        fig.tight_layout()
        plt.savefig('fig.png', bbox_inches='tight')
    plt.show()

def loadData(datafile):
    data = dict()
    #take only certain fraction of moves to speed up the computation
    fractionOfMoves = 3
    with open(datafile, 'rb') as df:
        reader = csv.reader(df, delimiter = ",")
        reader.next() #skip first line
        moves = 0
        for line in reader:
            ID = int(line[4])
            if ID not in data:
                data[ID] = {"m":[],"c":[],"h":[],"s":[]}
            if line[3] == 'm':
                moves += 1
                if moves % fractionOfMoves != 0:
                    continue
            data[ID][line[3]].append([int(line[0]),int(line[1]),int(line[2])])
    return data

"""
Show mouse clicks on the image of the site.
"""
def showClicks(data, keys, subplot):
    x,y = [],[]
    for ID in keys:
        for click in data[ID]['c']:
            x.append(click[0])
            y.append(click[1])
    subplot.plot(x,y,linestyle='None',marker='x',color='red',mew=3, ms=10)

"""
Show mouse moves on the image of the site.
"""
def showMoves(data, keys, subplot):
    x,y = [],[]
    for ID in keys:
        for point in data[ID]['m']:
            x.append(point[0])
            y.append(point[1])
    subplot.plot(x,y,lw=1,color='#000066')

"""
computes interest heatmap for a set of moves.
"""
def computeInterestMap(data, ids, width, height, dx, dy):
    moves = []
    for ID in ids:
        moves += data[ID]['m']
    distanceFactor = 0.5
    heatmap = np.zeros((height/dy, width/dx))
    for i in range(len(heatmap[0])):
        for j in range(len(heatmap)):
            total = 0
            for point in moves:
                dist = getDistance(i*dx,j*dy,point[0],point[1])
                if dist == 0:
                    dist = 1
                total += 1/(dist ** distanceFactor)
            heatmap[j][i] += total
    return heatmap

def getDistance(x1,y1,x2,y2):
    return ((x1-x2)**2 + (y1-y2)**2)**0.5

"""
Shows interest heatmap based on mouse moves.
"""
def showInterestMap(subplot, heatmap, width, height):
    img = Image.fromarray(heatmap)
    img = img.resize((width, height), Image.BILINEAR)
    heatmap = np.asarray(img)
    subplot.imshow(heatmap, cmap=cm.jet, alpha=0.6)

"""
Show interest points for either one or multiple sessions.
"""
def showInterestPoints(subplot, heatmap, dx, dy):
    computeInterestPoints(heatmap, subplot)
    """x, y = [], []
    for pt in points:
        x.append(x*dx)
        y.append(y*dy)
    print len(x)
    subplot.plot(x,y,linestyle='None',marker='o',color='black',mew=2)
    """

"""
Compute interest points (local minima) with gradient.
Need to finish.
"""
def computeInterestPoints(heatmap, subplot):
    """
    for i in range(10):
        x = random.randint(0,96)
        y = random.randint(0,66)
        gradientDescent(heatmap, 40, 30, 1, subplot)
    """
    gradientDescent(heatmap, 27, 20, 5, subplot)

#just experimenting
def gradientDescent(heatmap, startX, startY, step, subplot):
    gradient = np.gradient(heatmap)
    gradientX, gradientY = gradient[1], gradient[0]
    X, Y = startX, startY
    prevX, prevY, prevvX, prevvY = -1, -1, -1, -1
    stop = False
    i = 0
    color = (random.random(), random.random(), random.random())
    while not stop:
        i += 1
        gx, gy = gradientX[X][Y], gradientY[X][Y]
        print X, Y, gx, gy
        X += int(gx * step)
        Y += int(gy * step)
        stop = (gx == 0 and gy == 0) or (X == prevvX and Y == prevvY) or i > 1000 or X < 0 or X > 96 or Y < 0 or Y > 66
        prevvX, prevvY = prevX, prevY
        prevX, prevY = X, Y
        subplot.plot(X*10,Y*10,linestyle='None',marker='x',color='black',mew=1)
    print i
    

"""
Show stress on the mouse trajectory. data_stress.txt required.
"""
def showStressMap():
    #load data
    coords, values, time = loadStressData()
    #normalize distribution
    values = np.array(values)
    values /= (np.mean(values)/0.5)
    values = np.clip(values,0,1)
    #display data
    for i in range(len(coords)-1):
        zipped = zip(coords[i], coords[i+1])
        #choose appropriate colormap
        col = cm.autumn(values[i])
        plt.plot(zipped[0],zipped[1],lw=3,color=col)

"""
Show stress graph.
x-axis: time
y-axis: stress
"""
def showStressGraph():
    #load data
    coords, values, time = loadStressData()
    time = np.array(time, 'float64')
    #normalize time by the first value and convert into seconds
    time = (time - time[0])/1000
    smoothDegree = 15
    smoothed = []
    #average over neighboring values
    for i in range(len(values)):
        neigh = 0
        count = 0
        for j in range(1,smoothDegree):
            if i-j >= 0:
                neigh += values[i-j]
                count += 1
            if i+j < len(values):
                neigh += values[i+j]
                count += 1
        neigh += values[i]
        neigh /= count + 1
        smoothed.append(neigh)
    #visualize on a new plot
    fig = plt.figure(figsize=(8,3))
    stressplot = fig.add_subplot(1,1,1)
    plt.xlabel('Time (seconds)')
    plt.ylabel('Mouse energy')
    stressplot.plot(time, smoothed, color=(0.8,0,0))
    plt.savefig('stress' + str(smoothDegree) + '.png', bbox_inches='tight')

"""
Loads stress data from data_stress.txt
Returns 3-tuple (coordinates, values, time)
"""
def loadStressData():
    with open("data_stress.txt") as f:
        raw = f.read()
    raw = raw.split("\n")
    raw = raw[:len(raw)-1]
    coords, values, time = [], [], []
    for line in raw:
        ln = line.split(" ")
        coords.append([int(ln[1]),int(ln[2])])
        values.append(float(ln[0]))
        time.append(int(ln[3]))
    return (coords, values, time)

if __name__ == "__main__":
    visualize()

