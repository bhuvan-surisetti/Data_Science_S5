import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import RocCurveDisplay

df=pd.DataFrame({
'Credit_Score':[710,580,640,520,790],
'Income':[65,35,45,28,110],
'Emp_Status':['Employed','Unemployed','Employed','Unemployed','Employed'],
'Default':['No','Yes','No','Yes','No']
})

le=LabelEncoder()
df['Emp_Status']=le.fit_transform(df['Emp_Status'])
df['Default']=le.fit_transform(df['Default'])

X=df[['Credit_Score','Income','Emp_Status']]
y=df['Default']

m=LogisticRegression().fit(X,y)

print("Prediction:",m.predict([[600,40,1]])[0])
print("Probability:",m.predict_proba([[600,40,1]]))

RocCurveDisplay.from_estimator(m,X,y)
plt.show()
