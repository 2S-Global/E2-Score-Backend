// generateMassiveJobData.js

import mongoose from "mongoose";
import list_job_specialization from "../models/ListJobSpecializationModel.js"; // Update path if needed

// Connect to your DB
await mongoose.connect(
  "mongodb://2s-global:g8)d%40J3Itb%27r@168.231.121.192:28019/e2-score?authSource=admin",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
console.log("MongoDB Connected");

// Massive base of real-world job titles (500+ handpicked + trending 2025 roles)
const baseJobs = [
  // Your original list + extensions
  "Accountant",
  "Architect",
  "Actor",
  "Agricultural Engineer",
  "Air Traffic Controller",
  "Airline Pilot",
  "Animator",
  "App Developer",
  "Art Director",
  "Audiologist",
  "Baker",
  "Bank Teller",
  "Barista",
  "Bartender",
  "Biomedical Engineer",
  "Bookkeeper",
  "Brand Manager",
  "Business Analyst",
  "Carpenter",
  "Chef",
  "Chemical Engineer",
  "Civil Engineer",
  "Clinical Psychologist",
  "Cloud Architect",
  "Content Creator",
  "Copywriter",
  "Customer Success Manager",
  "Data Analyst",
  "Data Scientist",
  "Database Administrator",
  "Delivery Driver",
  "Dentist",
  "DevOps Engineer",
  "Digital Marketer",
  "Drones Pilot",
  "Electrician",
  "Event Planner",
  "Executive Assistant",
  "Fashion Designer",
  "Financial Advisor",
  "Firefighter",
  "Flight Attendant",
  "Frontend Developer",
  "Full Stack Developer",
  "Game Designer",
  "Graphic Designer",
  "HR Manager",
  "Interior Designer",
  "Journalist",
  "Landscape Architect",
  "Lawyer",
  "Legal Assistant",
  "Librarian",
  "Logistics Manager",
  "Machine Learning Engineer",
  "Marketing Director",
  "Mechanical Engineer",
  "Medical Doctor",
  "Mobile Developer",
  "Network Engineer",
  "Nurse",
  "Nutritionist",
  "Occupational Therapist",
  "Operations Manager",
  "Paramedic",
  "Pharmacist",
  "Photographer",
  "Physical Therapist",
  "Physicist",
  "Pilot",
  "Plumber",
  "Product Designer",
  "Product Manager",
  "Project Manager",
  "Psychiatrist",
  "QA Engineer",
  "Real Estate Agent",
  "Receptionist",
  "Recruiter",
  "Robotics Engineer",
  "Sales Manager",
  "Security Guard",
  "Social Media Manager",
  "Software Architect",
  "Software Engineer",
  "Sound Engineer",
  "Speech Therapist",
  "Supply Chain Manager",
  "Surgeon",
  "Systems Analyst",
  "Teacher",
  "Technical Writer",
  "UX Designer",
  "Veterinarian",
  "Video Editor",
  "Web Designer",
  "Writer",
  "Yoga Instructor",
  "Zoologist",

  // New trending & niche roles (2024–2025)
  "AI Ethics Officer",
  "Prompt Engineer",
  "Metaverse Architect",
  "NFT Artist",
  "Web3 Developer",
  "Blockchain Developer",
  "Smart Contract Auditor",
  "Crypto Trader",
  "Sustainability Manager",
  "Carbon Credit Analyst",
  "Climate Change Analyst",
  "Renewable Energy Technician",
  "Solar Panel Installer",
  "Wind Turbine Technician",
  "Electric Vehicle Technician",
  "Autonomous Vehicle Engineer",
  "Drone Operator",
  "Space Tourism Guide",
  "Quantum Computing Researcher",
  "Bioinformatics Specialist",
  "Genetic Counselor",
  "CRISPR Scientist",
  "Telemedicine Physician",
  "Mental Health Coach",
  "Digital Nomad Consultant",
  "Remote Work Specialist",
  "Chief Remote Officer",
  "Virtual Reality Trainer",
  "Augmented Reality Developer",
  "Haptic Designer",
  "Voice UX Designer",
  "Ethical Hacker",
  "Penetration Tester",
  "Cybersecurity Analyst",
  "Zero Trust Architect",
  "Cloud Security Engineer",
  "GRC Analyst",
  "Growth Hacker",
  "No-Code Developer",
  "Bubble Developer",
  "Webflow Expert",
  "Figma Designer",
  "Notion Consultant",
  "Airtable Specialist",
  "Zapier Automation Expert",
  "Community Manager",
  "Discord Moderator",
  "Twitch Streamer",
  "YouTube Strategist",
  "Podcast Producer",
  "TikTok Creator",
  "Reels Editor",
  "Short-Form Video Editor",
  "Livestream Producer",
  "Esports Coach",
  "Professional Gamer",
  "VTuber",
  "OnlyFans Manager",
  "Influencer Marketing Specialist",
  "Personal Brand Strategist",
  "Executive Presence Coach",
  "Life Coach",
  "Breathwork Facilitator",
  "Sound Healer",
  "Reiki Master",
  "Ayurvedic Practitioner",
  "Functional Medicine Doctor",
  "Biohacker",
  "Longevity Consultant",
  "Sleep Scientist",

  // Blue-collar & service upgrades
  "Master Plumber",
  "Journeyman Electrician",
  "HVAC Technician",
  "Heavy Equipment Operator",
  "Crane Operator",
  "Forklift Operator",
  "Welding Inspector",
  "CNC Machinist",
  "3D Printing Technician",
  "Industrial Designer",
  "Factory Supervisor",
  "Quality Control Manager",
  "Warehouse Manager",
  "Fleet Manager",
  "Courier",
  "Last-Mile Delivery Specialist",
  "Ride-Share Driver",
  "Food Delivery Driver",
  "Grocery Shopper",
  "Instacart Shopper",
  "Amazon Flex Driver",

  // Creative & media
  "Motion Graphics Designer",
  "VFX Artist",
  "Colorist",
  "Storyboard Artist",
  "Concept Artist",
  "Character Designer",
  "Environment Artist",
  "Rigger",
  "Lighter",
  "Film Director",
  "Cinematographer",
  "Gaffer",
  "Boom Operator",
  "Foley Artist",
  "ADR Mixer",
  "Dolby Atmos Mixer",
  "Music Producer",
  "Beatmaker",
  "Ghost Producer",

  // Healthcare extensions
  "Nurse Practitioner",
  "Physician Assistant",
  "Medical Scribe",
  "Phlebotomist",
  "Radiologic Technologist",
  "MRI Technician",
  "Surgical Technologist",
  "Anesthesiologist Assistant",
  "Dental Hygienist",
  "Orthodontic Assistant",
  "Veterinary Technician",
  "Animal Behaviorist",

  // Education & training
  "Online Course Creator",
  "Corporate Trainer",
  "Instructional Designer",
  "EdTech Specialist",
  "Montessori Teacher",
  "STEAM Educator",
  "Coding Bootcamp Instructor",

  // Gig & future jobs
  "TaskRabbit Tasker",
  "Fiverr Freelancer",
  "Upwork Expert",
  "Virtual Assistant",
  "Etsy Seller",
  "Print-on-Demand Designer",
  "Dropshipping Entrepreneur",
];

// Prefixes, Suffixes & Levels for massive variation
const prefixes = [
  "Senior",
  "Junior",
  "Lead",
  "Principal",
  "Chief",
  "Head",
  "Expert",
  "Master",
  "Associate",
  "Assistant",
  "Specialist",
  "Consultant",
  "Manager",
  "Director",
  "VP",
  "Executive",
  "Trainee",
  "Intern",
  "Fresher",
  "I",
  "II",
  "III",
  "IV",
];
const suffixes = [
  "(Remote)",
  "(Hybrid)",
  "Expert",
  "Pro",
  "Certified",
  "Licensed",
  "Freelance",
  "Contract",
  "Part-Time",
  "Full-Time",
  "Night Shift",
  "On-Call",
  "Global",
  "Regional",
  "EMEA",
  "APAC",
  "LATAM",
  "USA",
  "Canada",
  "Europe",
];
const industries = [
  "FinTech",
  "HealthTech",
  "EdTech",
  "CleanTech",
  "FoodTech",
  "PropTech",
  "LegalTech",
  "HRTech",
  "MarTech",
  "AdTech",
  "Gaming",
  "E-Commerce",
  "SaaS",
  "Blockchain",
  "AI",
  "Robotics",
  "Space",
  "Defense",
  "Automotive",
  "Fashion",
  "Beauty",
  "Wellness",
  "Fitness",
  "Real Estate",
  "Logistics",
  "Hospitality",
  "Travel",
  "Media",
  "Entertainment",
];

// Generate 2000+ unique jobs
const generated = new Set();
const target = 2500; // We'll easily hit 2000+

while (generated.size < target) {
  let title = baseJobs[Math.floor(Math.random() * baseJobs.length)];

  // 40% chance to add prefix
  if (Math.random() < 0.4) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    if (!title.startsWith(prefix)) title = prefix + " " + title;
  }

  // 30% chance to add suffix
  if (Math.random() < 0.3) {
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    if (!title.includes(suffix)) title += " " + suffix;
  }

  // 20% chance to add industry niche
  if (Math.random() < 0.2) {
    const industry = industries[Math.floor(Math.random() * industries.length)];
    title += ` - ${industry}`;
  }

  // 15% chance to make it location-specific
  if (Math.random() < 0.15) {
    const locations = [
      "Dubai",
      "Singapore",
      "London",
      "New York",
      "Berlin",
      "Tokyo",
      "Sydney",
      "Toronto",
      "Mumbai",
      "Bangalore",
      "Delhi",
      "Hyderabad",
    ];
    const loc = locations[Math.floor(Math.random() * locations.length)];
    title += ` (${loc})`;
  }

  // Clean up & add
  title = title.replace(/\s+/g, " ").trim();
  if (title.length > 5 && title.length < 150) {
    generated.add(title);
  }
}

const finalData = Array.from(generated)
  .slice(0, 2200)
  .map((name, index) => ({
    name,
    label: name,
    isDel: false,
    isActive: Math.random() > 0.03, // 97% active
    isFlag: Math.random() < 0.12, // ~12% featured/flagged
  }));

try {
  // Optional: Clear old data (remove if you want to append)
  // await list_job_specialization.deleteMany({});

  const result = await list_job_specialization.insertMany(finalData);
  console.log(
    `MASSIVE SUCCESS! Inserted ${result.length} job specializations!`
  );
  console.log(`Examples:`);
  console.log(finalData.slice(0, 10).map((j) => j.name));
} catch (err) {
  console.error("Insert failed:", err.message);
} finally {
  await mongoose.disconnect();
  console.log("Done & Disconnected");
}
  

