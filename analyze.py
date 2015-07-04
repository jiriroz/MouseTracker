"""
Analyze mouse trajectory data.
"""

import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import numpy as np
import csv
import sys

def loadData():
    data = dict()
    with open('log.csv', 'rb') as datafile:
        reader = csv.reader(datafile, delimiter = ",")
        reader.next() #skip first line
        for line in reader:
            ID = int(line[4])
            if ID not in data:
                data[ID] = {"m":[],"c":[],"h":[],"s":[]}
            data[ID][line[3]].append([int(line[0]),int(line[1]),int(line[2])])
    return data

def showClicks(data, ID, subplot):
    x,y = [],[]
    for click in data[ID]['c']:
        x.append(click[0])
        y.append(click[1])
    subplot.plot(x,y,linestyle='None',marker='x',color='red',mew=2)

def showMoves(data, ID, subplot):
    x,y = [],[]
    for point in data[ID]['m']:
        x.append(point[0])
        y.append(point[1])
    subplot.plot(x,y,lw=1,color='#000066')

#shows interest heatmap based on mouse moves
def showInterestMap(data, ID, subplot, width, height):
    heatmap = np.zeros((height, width))
    for point in data[ID]['m']:
        x = point[0]
        y = point[1]
        #creare some kind of a mask?

def visualize():
    imfile = sys.argv[1]
    image = mpimg.imread(imfile)
    width, height = len(image[0]), len(image)

    data = loadData()
    keys = data.keys()

    fig = plt.figure()
    sub = fig.add_subplot(1,1,1)
    plt.axis('off')
    sub.imshow(image)

    showClicks(data, keys[0], sub)
    showMoves(data, keys[0], sub)

    fig.tight_layout()
    plt.savefig('fig.png', bbox_inches='tight')

visualize()
