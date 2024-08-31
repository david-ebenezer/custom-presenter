n=int(input())
s=list(input())
c=0

for x in range(1,n-1):
    if s[x]=='.' and s[x-1]=='S' and s[x+1]=='S':
        c+=1
        s[x]='C'
        s[x-1]='P'
        s[x+1]='P'

fl=True
for x in range(n):
    if s[x]=='S':
        if((x>0 and s[x-1]=='.') or (x<n-1 and s[x+1]=='.')):
            c+=1
        else:
            fl=False
            break

print(c if fl else -1)

