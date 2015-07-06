"""
Analyze mouse trajectory data.
python analyze.py siteImage *options
siteImage - image of the website to draw the visualization on
*options:
-c - show clicks
-m - show moves
-im - show interest map
-ip - show interest points
-all - compute the features for all sessions
Need to choose -im in order to choose -ip.
"""

import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import matplotlib.cm as cm
import numpy as np
from PIL import Image
import csv
import sys

def loadData():
    data = dict()
    fraction = 1
    with open('log.csv', 'rb') as datafile:
        reader = csv.reader(datafile, delimiter = ",")
        reader.next() #skip first line
        moves = 0
        for line in reader:
            ID = int(line[4])
            if ID not in data:
                data[ID] = {"m":[],"c":[],"h":[],"s":[]}
            if line[3] == 'm':
                moves += 1
                if moves % fraction != 0:
                    continue
            data[ID][line[3]].append([int(line[0]),int(line[1]),int(line[2])])
    return data

def showClicks(data, keys, subplot):
    x,y = [],[]
    for ID in keys:
        for click in data[ID]['c']:
            x.append(click[0])
            y.append(click[1])
    subplot.plot(x,y,linestyle='None',marker='x',color='red',mew=2)

def showMoves(data, keys, subplot):
    x,y = [],[]
    for ID in keys:
        for point in data[ID]['m']:
            x.append(point[0])
            y.append(point[1])
    subplot.plot(x,y,lw=1,color='#000066')

#shows interest heatmap based on mouse moves
def showInterestMap(data, keys, subplot, width, height, dx, dy):
    moves = []
    for ID in keys:
        moves += data[ID]['m']
    heatmap = computeInterestMap(moves, width, height, dx, dy)
    subplot.imshow(heatmap, cmap=cm.jet, alpha=0.5)
    return heatmap

#computes interest heatmap for one session
def computeInterestMap(moves, width, height, dx, dy):
    alpha = 0.5
    beta = 1
    heatmap = np.zeros((height/dy, width/dx))
    for i in range(len(heatmap[0])):
        for j in range(len(heatmap)):
            total = 0
            for point in moves:
                dist = getDistance(i*dx,j*dy,point[0],point[1])
                if dist == 0:
                    dist = 0.01
                total += 1/(dist**alpha)
            heatmap[j][i] += total
    heatmap *= beta
    img = Image.fromarray(heatmap)
    img = img.resize((width, height), Image.BILINEAR)
    heatmap = np.asarray(img)
    return heatmap

def getDistance(x1,y1,x2,y2):
    return ((x1-x2)**2 + (y1-y2)**2)**0.5

def showInterestPoints(subplot, heatmap, dx, dy):
    points = computeInterestPoints(heatmap)
    x,y = [],[]
    for pt in points:
        x.append(pt[0])
        y.append(pt[1])
    subplot.plot(x,y,linestyle='None',marker='o',color='black',mew=3)

"""
Compute interest points (local minima) with gradient
"""
def computeInterestPoints(heatmap):
    grad = np.gradient(heatmap)
    points = []
    for row in range(len(grad[0])):
        #print min(grad[row])
        for col in range(len(grad[0])):
            if grad[0][row][col] == 0 and grad[1][row][col] == 0:
                points.append([row, col])
    print len(points)
    return points

def visualize():
    imfile = sys.argv[1]
    options = sys.argv[2:]
    clicks = '-c' in options
    moves = '-m' in options
    intrmap = '-im' in options
    intrpts = '-ip' in options
    compall = '-all' in options

    image = mpimg.imread(imfile)
    width, height = len(image[0]), len(image)
    dx, dy = 10, 10 #spacing of the heatmap

    data = loadData()
    keys = data.keys()

    fig = plt.figure()
    sub = fig.add_subplot(1,1,1)
    plt.axis('off')
    sub.imshow(image)

    #IDs to compute the features for
    ids = [keys[0]]
    if compall:
        ids = keys

    if clicks:
        showClicks(data, ids, sub)
    if moves:
        showMoves(data, ids, sub)
    if intrmap:
        heatmap = showInterestMap(data, ids, sub, width, height, dx, dy)
    if intrpts:
        showInterestPoints(sub, heatmap, dx, dy)
    fig.tight_layout()
    plt.savefig('fig.png', bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    visualize()
