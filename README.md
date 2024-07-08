# Conceptualization and Implementation of a Document Room for a Digital Pentomino Game

## Introduction
Pentomino Digital is a digital version of the analog Pentomino board game, designed primarily for use in primary schools to help improve children's spatial thinking and geometrical learning. The goal of the game is to cover a board completely with pentomino pieces without any empty spaces. This project introduces a new feature called the "Document Room," which allows users to annotate, save, and manage game situations for later use or sharing.

<div align="center">
  <img src="https://github.com/AhmadUPB/pentomino_dr/blob/main/appinfo/game.png" alt="Pentomino Game Board"  style="width: 60%; margin: 20px;">
  <p><em>Figure 1: Pentomino Game Board</em></p>
</div>

## New Features
- **Annotation of Game Situations:** Teachers and students can annotate interesting game cases, freeze pieces in certain positions, highlight pieces or board positions, and take notes.
  
<div align="center">
  <img src="https://github.com/AhmadUPB/pentomino_dr/blob/main/appinfo/annotations.png" alt="Annotation Mode"  style="width: 60%; margin: 20px;">
  <p><em>Figure 2: Making Annotations on a game situation</em></p>
</div>

- **Saving and Managing Game Situations:** Teachers can store game situations, visually differentiate and compare stored game situations, and organize them spatially in a "Document Room".

- **Sharing Game Situations:** Teachers can share annotated game situations with others, allowing them to access and continue the game with all annotations and specifications.

<div align="center">
  <img src="https://github.com/AhmadUPB/pentomino_dr/blob/main/appinfo/sending_games.png" alt="Managing and sending game situations"  style="width: 60%; margin: 20px;">
  <p><em>Figure 3: managing and sending game situations</em></p>
</div>

- **Authentication System:** An authentication feature was added to the app to allow teachers to store their game situations on the server for later access.


<div align="center">
  <img src="https://github.com/AhmadUPB/pentomino_dr/blob/main/appinfo/login.png" alt="Authentication System"  style="width: 60%; margin: 20px;">
  <p><em>Figure 4: Authentication System</em></p>
</div>

## Installation
To install and run this project locally using Apache server and XAMPP, follow these steps:

1. **Download and Install XAMPP:**
   - Download XAMPP from [Apache Friends](https://www.apachefriends.org/index.html).
   - Follow the installation instructions for your operating system.

2. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git

3. **Move Project Files:**
   - Navigate to the XAMPP installation directory.
   - Move the cloned repository into the htdocs directory. For example:
   ```bash
   mv your-repo-name /path/to/xampp/htdocs/
4. **Start Apache Server:**
   - Open the XAMPP Control Panel.
   - Start the Apache server by clicking the "Start" button next to "Apache".
   - 
5. **Access the Project:**
   - Open your web browser and go to http://localhost/your-repo-name
  
## Contact
For any questions or feedback, please contact Ahmad Alfakes at nm.3@hotmail.com
