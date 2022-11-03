---
name: User Stories
about: Use this template for user stories submission
title: "C3 Phase 1: User Stories"
labels: []
assignees: ""
---

Make sure to follow the *Role, Goal, Benefit* framework for the user stories and the *Given/When/Then* framework for the Definitions of Done! For the DoDs, think about both success and failure scenarios. You can also refer to the examples DoDs in [C3 spec](https://sites.google.com/view/ubc-cpsc310-22w1/project/checkpoint-3#h.8c0lkthf1uae).

## User Story 1
As a student, I want to be able to give a department code and see a list of all the courses offered by that department, containing course id, title and the total number of sections offered in the past, so that I can have a good measure of how popular each course is and make registration decisions based off it.


#### Definitions of Done(s)
Scenario 1: Valid department code<br/>
Given: The user is on the application's Courses section<br/>
When: The user enters a valid department code and clicks on the "search" button<br/>
Then: The application displays a list of all courses offered by that department on the dashboard. The list contains the course id, course title and the total number of sections offered for that course in the past.

Scenario 2: Invalid department code<br/>
Given: The user is on the application's Courses section<br/>
When: The user enters an invalid department code and clicks on the "search" button<br/>
Then: The application displays an error message on the dashboard saying that the requested department code is invalid.


## User Story 2
As a student, I want to be able to search for a room by its name and get its building's full name and address as well as room's type, furniture and number of seats so that I can locate and get insight about the rooms mentioned in my course schedule, office hours schedule and exam schedule before attending them.


#### Definitions of Done(s)
Scenario 1: Correct room name<br/>
Given: The user is on the application's Rooms section<br/>
When: The user enters a valid room name and clicks on "get info" button<br/>
Then: The application displays the building's full name and address as well as room's type, furniture and number of seats on the dashboard.

Scenario 2: Incorrect room name<br/>
Given: The user is on the application's Rooms section<br/>
When: The user enters a room name that is invalid or does not exist and clicks on "get info" button<br/>
Then: The application displays an error on the dashboard telling the user that the requested room does not exist.


## Others
You may provide any additional user stories + DoDs in this section for general TA feedback.  
But these will not be graded.
