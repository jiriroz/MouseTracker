import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import matplotlib.cm as cm
import numpy as np
import random

image = mpimg.imread("spring.png")

with open("out.txt") as f:
    raw = f.read()

raw = raw.split("\n")
raw = raw[:len(raw)-1]
coords, values = [], []

for line in raw:
    ln = line.split(" ")
    coords.append([int(ln[1]),int(ln[2])])
    values.append(float(ln[0]))

#normalize distribution
values = np.array(values)
values /= (np.mean(values)/0.5)
values = np.clip(values,0,1)

fig = plt.figure()
sub = fig.add_subplot(1,1,1)
plt.axis('off')
sub.imshow(image)

for i in range(len(coords)-1):
    zipped = zip(coords[i], coords[i+1])
    #choose appropriate colormap
    col = cm.autumn(values[i])
    plt.plot(zipped[0],zipped[1],lw=3,color=col)

fig.tight_layout()
plt.savefig('stress.png', bbox_inches='tight')
plt.show()
