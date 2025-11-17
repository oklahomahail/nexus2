# Segmentation Help Guide

## What is Segmentation?

Segmentation allows you to send **different versions** of the same campaign to **different groups of donors**. Instead of one-size-fits-all messaging, you can tailor your content to specific donor behaviors and preferences.

**Example:** For a year-end campaign, you might send:
- A gratitude-focused message to active donors
- A reactivation message to LYBUNT donors (gave last year, not this year)
- A first-gift appeal to engaged non-donors

Each group receives content that speaks directly to their relationship with your organization.

---

## Getting Started

### 1. Understanding Segments

A **segment** is a group of donors defined by behavioral criteria such as:
- **Recency:** When they last gave (e.g., last 30 days, last year)
- **Frequency:** How often they give (e.g., monthly, annually)
- **Engagement:** How they interact with your organization (email opens, event attendance)
- **Channel Preference:** How they prefer to be contacted (email, direct mail)

**Important:** Segments use *only behavioral data* - no PII (personally identifiable information) or dollar amounts are stored.

### 2. Default Segments

Nexus comes with 10 pre-configured segments based on fundraising best practices:

- **All Donors:** Anyone who has given at least once
- **Never Given:** Prospects who haven't donated yet
- **LYBUNT:** Gave last year, but not yet this year (reactivation opportunity)
- **SYBUNT:** Gave sometime in the past, but not recently (win-back opportunity)
- **Monthly Donors:** Active sustainers/recurring givers
- **Annual Donors:** Give once per year
- **Major Donors (Behavioral):** High engagement + high giving frequency
- **High Engagement Non-Donors:** Active followers who haven't given yet
- **Prefers Email:** Responds best to digital outreach
- **Prefers Direct Mail:** Responds best to traditional mail

### 3. Creating Custom Segments

Need a segment we don't provide? Create your own:

1. Click **"+ New Segment"**
2. Name your segment (e.g., "Lapsed Monthly Donors")
3. Add criteria:
   - Recency: "Last 6 months"
   - Giving Type: "Monthly"
   - Engagement: "Low"
4. Save and use in your campaigns

---

## Using Segmentation in Campaigns

### Creating Deliverable Versions

When composing a campaign deliverable (email, direct mail, etc.):

1. **Add a Version:** Click "+ Add Version"
2. **Select Segment:** Choose which donor group this version targets
3. **Write Content:** Craft messaging tailored to that segment
4. **Repeat:** Create additional versions for other segments

**Tip:** Use the **"Apply Recommended Segmentation"** wizard for quick setup based on campaign type.

### Version Priority (Important!)

When donors appear in **multiple segments**, they receive content from the **highest version** in your list.

**Example:**
- Version 1: Major Donors
- Version 2: Monthly Donors
- Version 3: All Donors

A donor who is both a major donor AND a monthly donor will receive the Version 1 content (highest priority).

**How to reorder:** Drag and drop versions to change priority.

---

## AI-Powered Features

### 1. Content Recommendations

Each segment has AI-generated messaging recommendations:
- **Tone guidance:** How to write for this audience
- **Timing notes:** When to send
- **Key techniques:** What messaging strategies work best

**Where to find it:** Click on any segment card to see recommendations.

### 2. AI Content Coaching

Get instant content optimization:
1. Write your initial draft
2. Click **"Rewrite for this segment"**
3. Review the AI-optimized version
4. Accept, edit, or keep your original

**What it does:**
- Adjusts tone for the segment
- Adds segment-specific techniques (gratitude, urgency, etc.)
- Optimizes for channel (email, SMS, direct mail)

### 3. Recommended Segmentation Wizard

Not sure which segments to use? Let AI suggest:
1. Click **"Apply recommended segmentation"**
2. Review suggested segments based on campaign type
3. Select which ones to include
4. Versions are auto-created with proper labels and priority

**Available for these campaign types:**
- Year-End
- Acquisition
- Monthly Giving / Upgrade
- General Appeal
- Event
- Donor Reactivation

---

## Understanding Overlap

### What is Overlap?

**Overlap** occurs when a single donor matches criteria for multiple segments.

**Example:** A monthly donor who gave last year is in both:
- "Monthly Donors" segment
- "All Donors" segment

### How Nexus Handles Overlap

✅ **Automatic Deduplication:** Each recipient gets only ONE version of your campaign
✅ **Priority-Based:** They receive content from their highest-priority matching version
✅ **No Over-Messaging:** You don't accidentally send multiple emails to the same person

### Overlap Visualizations

**Venn Diagram** (for top 3 segments):
- Shows how your top segments intersect
- Displays unique vs. overlapping recipients
- Quick visual for understanding composition

**Flow Diagram** (Sankey):
- Shows overlap across ALL segments
- Thicker flows = more overlap
- Detailed view for complex campaigns

**Where to find it:** Segmentation dashboard > "Overlap Analysis" tab

---

## Performance Tracking

After your campaign launches, track results by segment version:

### Metrics Available
- **Response Rate:** % who donated
- **Total Revenue:** Money raised from this version
- **Average Gift:** Mean donation amount
- **ROI:** Return on investment
- **Engagement:** Opens, clicks (for email)

### Using Performance Data

📊 **Compare versions** to see which segments respond best
📈 **Inform future campaigns** with data-driven segment selection
🎯 **Refine messaging** based on what works for each audience

---

## Best Practices

### 1. Start Simple
Begin with 2-3 versions for your first segmented campaign:
- All Donors
- LYBUNT (reactivation)
- Non-Donors (if acquisition)

### 2. Test and Learn
- Run A/B tests within segments
- Track what messaging resonates
- Iterate based on results

### 3. Mind Your Overlaps
- Use overlap visualizations to understand composition
- Ensure priority order reflects your strategy
- Major donors > Monthly donors > All donors is a common pattern

### 4. Use AI Recommendations
- Let AI guide your content for each segment
- Start with recommended segmentation for campaign types
- Review and customize - AI is a starting point, not a replacement

### 5. Keep Segments Behavioral
- Avoid creating too many niche segments
- Focus on behaviors, not demographics
- 3-5 versions per deliverable is usually ideal

---

## Common Questions

**Q: Can I use the same segment across multiple campaigns?**
A: Yes! Segments are reusable. Create once, use everywhere.

**Q: What if a donor doesn't match any segment?**
A: They won't receive that deliverable. Make sure you have a broad segment (like "All Donors") to catch everyone.

**Q: Can I edit a segment after creating versions?**
A: Yes, but be careful - changing criteria affects who receives your content.

**Q: How often do segment sizes update?**
A: Segment estimates refresh nightly based on the latest behavioral data.

**Q: Can I export segment lists?**
A: For privacy, we don't export PII. You can see aggregate counts and use segments in campaigns.

**Q: Is there a limit to custom segments?**
A: No hard limit, but we recommend keeping your catalog manageable (10-15 active segments).

---

## Need More Help?

- **📚 Video Tutorials:** [Link to tutorial library]
- **💬 Live Chat:** Available weekdays 9am-5pm PT
- **📧 Email Support:** support@nexus.com
- **🎓 Webinars:** Monthly segmentation strategy sessions

---

## Glossary

**LYBUNT:** Last Year But Unfortunately Not This year - donors who gave last year but haven't given yet this year

**SYBUNT:** Some Year But Unfortunately Not This year - donors who gave sometime in the past but not recently

**Behavioral Segment:** A donor group defined by actions and patterns, not demographics

**Deliverable:** A campaign communication (email, direct mail, SMS, etc.)

**Version:** A variant of a deliverable targeted to a specific segment

**Overlap:** When a donor matches criteria for multiple segments

**Deduplication:** Ensuring each recipient gets only one version of a campaign

**Priority:** The order of versions, determining which content overlapping donors receive
