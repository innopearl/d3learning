FILENAME=$1
x=$(cat $FILENAME  | grep '>' | sed -e 's/.*percentile //g' -e 's/ observation//g' -e 's/.*-> //g' | sed 's/ //g')
echo $x | sed -e 's/\n//g' -e s'/ Test/\nTest/g' | 
python -c "
import sys
import json
import re

def getName(x):
    if x == '<MIN>': return '0.00'
    if x == '<MAX>': return '100.00'
    if x == 'Test': return ''
    return x

view1 = []
view2 = {}

for line in sys.stdin:
    item1 = dict(token.split('=') for token in line.split(' '))
    view1.append(item1)
    #print item1   
 
    name = item1.setdefault('Test', '')
    for key, value in item1.items():
        field = getName(key)
        if field == '': continue
        
        itempctl = view2.setdefault(field, {'percentile':field})
        itempctl.setdefault(name, value)
print('var data=%s' % (json.dumps(view2.values())) )
"



