---
name: User Stories
about: Use this template for user stories submission
title: "C3 Phase 1: User Stories"
labels: []
assignees: ""
---

Make sure to follow the *Role, Goal, Benefit* framework for the user stories and the *Given/When/Then* framework for the
Definitions of Done! For the DoDs, think about both success and failure scenarios. You can also refer to the examples 
DoDs in [C3 spec](https://sites.google.com/view/ubc-cpsc310-22w1/project/checkpoint-3#h.8c0lkthf1uae).

#### Please note: Our User Stories have been updated slightly for C3 phase 2 to better reflect the wordings used in the UI. 

## User Story 1
As a student, I want to be able to pass a department code to the application and see a list of all the courses offered 
by that department, containing course number, name and the total number of sections offered for that course, so that I 
can have a good measure of how popular or important each course is and make registration decisions based on it.


#### Definitions of Done(s)
Scenario 1: Valid department code<br/>
Given: The user is on the Course Popularity Finder section of the application<br/>
When: The user enters a valid department code in the provided input field and clicks on the Find Courses button<br/>
Then: The application displays a list of all courses offered by that department on the dashboard. The list contains the 
course number, course name and the total number of sections offered for that course in the past. The list will be ordered
by decreasing number of total sections for each course to reflect the popularity/importance of the course.

Scenario 2: Invalid department code<br/>
Given: The user is on the Course Popularity Finder section of the application<br/>
When: The user enters an invalid or empty department code in the provided input field and clicks on the Find Courses button<br/>
Then: The application displays an error message on the dashboard saying that the requested department code is invalid.


## User Story 2
As a student, I want to be able to search for a room by its name and get its building's full name and address as well as 
the room's type, furniture and number of seats so that I can locate and get insight about the rooms mentioned in my 
course schedule, office hours schedule and exam schedule before attending them.


#### Definitions of Done(s)
Scenario 1: Correct room name<br/>
Given: The user is on the Campus Room Finder section of the application<br/>
When: The user enters a valid room name in the provided input field and clicks on the Find Room button<br/>
Then: The application displays the building's full name and address as well as room's type, furniture and number of seats on the dashboard.

Scenario 2: Incorrect room name<br/>
Given: The user is on the Campus Room Finder section of the application<br/>
When: The user enters a room name that is invalid or does not exist and clicks on the Find Room button<br/>
Then: The application displays an error on the dashboard telling the user that the requested room is invalid.


## Others
You may provide any additional user stories + DoDs in this section for general TA feedback.  
But these will not be graded.
