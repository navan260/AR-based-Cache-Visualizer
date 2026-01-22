# Quick Start Guide - Enhanced Cache Visualizer

## 🚀 Running the Application

The development server is now running at **http://localhost:5173**

Open this URL in your browser to see the enhanced visualizer!

## 📋 Quick Steps

### 1. Initialize Cache
In the left panel, configure:
- **Memory Size**: 16 KB (default)
- **Cache Size**: 1 KB (default)
- **Block Size**: 16 Bytes (default)
- **Mapping Type**: Try each one!
  - Direct Mapped (simplest)
  - Set Associative (balanced)
  - Fully Associative (most flexible)

Click **Initialize Cache**

### 2. Switch to Visualizer
Click **🎨 Interactive Visualizer** tab at the top

### 3. Access Memory
- Enter address: `0x0000` and click **Access**
- Watch the animated arrow from RAM → Cache!
- Try: `0x0010`, `0x0400`, `0x0800`

### 4. Toggle 3D View
Click the **3D View** button to see perspective effect

### 5. Learn
Read the explanation panel to understand how each mapping type works!

## 🎯 Try These Scenarios

### Demo 1: See Cache Conflicts (Direct Mapped)
```
Addresses: 0x0000, 0x0400, 0x0000
→ Watch how 0x0400 replaces 0x0000 (same cache line!)
```

### Demo 2: Set Associative Benefits
```
Switch to 2-Way Set Associative
Addresses: 0x0000, 0x0400
→ Both fit in the same set without conflict!
```

### Demo 3: Fully Associative Flexibility
```
Switch to Fully Associative
Access random addresses
→ No conflicts until cache is full!
```

## 🎨 Features to Explore

✅ **RAM Grid**: Hover over blocks to see addresses  
✅ **Cache Grid**: See valid bits, tags, access times  
✅ **Animated Arrows**: Green = hit, Red = miss  
✅ **Address Breakdown**: See Tag | Index | Offset bits  
✅ **Explanation Panel**: Learn while you explore  
✅ **Legend**: Color reference guide  
✅ **2D/3D Toggle**: Switch perspectives  

## 📊 Switch to Table View

Click **📊 Table View** to see the traditional statistics and cache state table.

---

**Enjoy exploring cache memory mapping! 🎓**
