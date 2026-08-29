# 🌤️ Weather App

A responsive weather application built with React that allows users to search for any city and view current weather conditions, hourly forecasts, and a 7-day forecast.

This project was built as a solution to the [Frontend Mentor Weather App Challenge](https://www.frontendmentor.io/challenges/weather-app-K1FhddVm49).

## 📋 Table of Contents

- [Overview](#overview)
  - [The Challenge](#the-challenge)
  - [Links](#links)
- [Features](#features)
- [Built With](#built-with)
- [How It Works](#how-it-works)
- [What I Learned](#what-i-learned)
- [Continued Development](#continued-development)
- [AI Collaboration](#ai-collaboration)
- [Getting Started](#getting-started)
- [Author](#author)

---

## Overview

### The Challenge

Users should be able to:

- Search for weather information by entering a location
- Select a location from search suggestions
- View the current weather conditions
- View the current temperature and weather icon
- View the feels-like temperature
- View humidity
- View wind speed
- View precipitation
- View a 7-day weather forecast
- View an hourly weather forecast
- Switch between different days in the hourly forecast
- Switch between Celsius and Fahrenheit
- Switch between km/h and mph
- Switch between millimeters and inches
- Automatically detect the user's current location
- View responsive layouts across different screen sizes
- See hover and focus states for interactive elements
- See loading states while weather data is being fetched

---

## 🔗 Links

- Solution URL: Add your Frontend Mentor solution URL here
- Live Site URL: Add your deployed website URL here

---

## ✨ Features

### 🔎 Location Search

Users can search for a city, state, or district.

Search suggestions are displayed using the Open-Meteo Geocoding API.

The weather data is fetched only after the user selects a location and clicks the Search button.

### 📍 Current Location

The application uses the browser's Geolocation API to detect the user's current location when the application starts.

The detected latitude and longitude are then used to fetch weather information automatically.

### 🌡️ Current Weather

The application displays:

- Current temperature
- Weather condition
- Location
- Date
- Feels-like temperature
- Humidity
- Wind speed
- Precipitation

### 🕐 Hourly Forecast

Users can view hourly weather information and switch between different days.

### 📅 Daily Forecast

A 7-day forecast displays:

- Day
- Weather condition
- Maximum temperature
- Minimum temperature

### ⚙️ Unit Conversion

The units dropdown allows users to switch between:

#### Temperature

- Celsius (°C)
- Fahrenheit (°F)

#### Wind Speed

- km/h
- mph

#### Precipitation

- Millimeters (mm)
- Inches (in)

The weather data does not need to be fetched again when changing units. Values are converted on the client side.

### ⏳ Loading States

Loading states are displayed while:

- Detecting the user's location
- Fetching weather information
- Loading hourly and daily forecast data

---

## 🛠️ Built With

- React.js
- Vite
- JavaScript
- HTML5
- Tailwind CSS
- Open-Meteo Weather API
- Open-Meteo Geocoding API
- BigDataCloud Reverse Geocoding API
- Browser Geolocation API

---

## 🔄 How It Works

### Initial Application Load

```text
Application starts
       ↓
Browser Geolocation API
       ↓
Get latitude & longitude
       ↓
Fetch weather data
       ↓
Reverse geocoding
       ↓
Display weather information
```
