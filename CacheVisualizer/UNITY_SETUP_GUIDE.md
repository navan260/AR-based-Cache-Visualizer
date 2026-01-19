# Unity Integration Guide

## Step-by-Step Setup for AR Cache Visualizer

This guide will help you integrate the core cache logic with Unity and AR Foundation.

---

## Prerequisites

### Software Requirements
- [ ] **Unity Hub** - Download from [unity.com](https://unity.com/download)
- [ ] **Unity 2022.3 LTS** or newer
- [ ] **Visual Studio 2022** or **Visual Studio Code**
- [ ] **Android Studio** (for Android) or **Xcode** (for iOS)

### Knowledge Requirements
- [ ] Basic Unity navigation (1-2 hour tutorial recommended)
- [ ] Understanding of GameObjects and Components
- [ ] Basic C# scripting in Unity

---

## Phase 1: Unity Project Setup

### 1.1 Create New Unity Project

1. Open **Unity Hub**
2. Click **"New Project"**
3. Select **3D (URP)** template
4. Project Name: `CacheVisualizerAR`
5. Location: Choose your preferred folder
6. Click **"Create Project"**

### 1.2 Configure Project Settings

**Player Settings** (Edit → Project Settings → Player):
- Company Name: Your name/team
- Product Name: `AR Cache Visualizer`
- Default Orientation: `Portrait` or `Auto Rotation`

**Quality Settings** (Edit → Project Settings → Quality):
- Select **Medium** or **High** quality level

---

## Phase 2: Install AR Foundation

### 2.1 Package Manager

1. Go to **Window → Package Manager**
2. Click **"+"** → **"Add package by name"**
3. Add these packages:

```
com.unity.xr.arfoundation
com.unity.xr.arcore (for Android)
com.unity.xr.arkit (for iOS)
```

### 2.2 Install TextMeshPro

1. **Window → TextMeshPro → Import TMP Essential Resources**
2. Click **"Import"**

---

## Phase 3: Import Core Scripts

### 3.1 Copy C# Files

Copy your existing core scripts to Unity:

```
YourUnityProject/
└── Assets/
    └── Scripts/
        ├── Core/
        │   ├── CacheConfiguration.cs
        │   ├── AddressComponents.cs
        │   ├── AddressDecoder.cs
        │   ├── CacheLine.cs
        │   ├── CacheAccessResult.cs
        │   ├── DirectMappingController.cs
        │   ├── SetAssociativeMappingController.cs
        │   ├── FullyAssociativeMappingController.cs
        │   └── ReplacementPolicyManager.cs
        └── Demo/
            └── DemoScenarios.cs
```

### 3.2 Verify Compilation

- Wait for Unity to compile
- Check **Console** (Ctrl+Shift+C) for errors
- Namespace should remain: `CacheVisualizer.Core`

---

## Phase 4: Create AR Scene

### 4.1 Setup AR Session

1. **Create Empty GameObject**: Right-click Hierarchy → Create Empty
   - Name: `AR Session Origin`

2. **Add AR Components**:
   - **GameObject → XR → AR Session**
   - **GameObject → XR → XR Origin (Action-based)**

### 4.2 Configure Camera

1. Select **Main Camera** (under XR Origin)
2. **Component → AR → AR Camera Manager**
3. **Component → AR → AR Camera Background**

### 4.3 Add Plane Detection

1. Select **XR Origin**
2. **Component → AR → AR Plane Manager**
   - Detection Mode: `Horizontal`
   - Plane Prefab: (we'll create this next)

---

## Phase 5: Create 3D Cache Model

### 5.1 Create Cache Line Prefab

1. **Right-click Hierarchy → 3D Object → Cube**
2. Name it `CacheLine`
3. Scale: `(0.8, 0.2, 0.3)`
4. **Add Component → Text - TextMeshPro**
   - Position above cube
   - Text: `Line 0`

5. **Materials**:
   - Create folder: `Assets/Materials`
   - Create 3 materials:
     - `CacheLineEmpty` (Gray)
     - `CacheLineHit` (Green)
     - `CacheLineMiss` (Red)

6. **Make Prefab**:
   - Drag `CacheLine` to `Assets/Prefabs/` folder
   - Delete from hierarchy

### 5.2 Create Cache Controller Script

Create `Assets/Scripts/Visualization/CacheVisualizer.cs`:

```csharp
using UnityEngine;
using TMPro;
using CacheVisualizer.Core;

public class CacheLineVisual : MonoBehaviour
{
    public TextMeshPro labelText;
    public Material emptyMaterial;
    public Material hitMaterial;
    public Material missMaterial;
    
    private Renderer blockRenderer;
    private CacheLine cacheLineData;
    
    void Start()
    {
        blockRenderer = GetComponent<Renderer>();
        UpdateVisuals();
    }
    
    public void SetCacheLineData(CacheLine line)
    {
        cacheLineData = line;
        UpdateVisuals();
    }
    
    public void ShowHit()
    {
        blockRenderer.material = hitMaterial;
        Invoke("ResetColor", 1.0f);
    }
    
    public void ShowMiss()
    {
        blockRenderer.material = missMaterial;
        Invoke("ResetColor", 1.0f);
    }
    
    void ResetColor()
    {
        UpdateVisuals();
    }
    
    void UpdateVisuals()
    {
        if (cacheLineData == null) return;
        
        if (cacheLineData.Valid)
        {
            blockRenderer.material = emptyMaterial;
            labelText.text = string.Format("Line {0}\nTag: {1:X}",
                cacheLineData.LineNumber, cacheLineData.Tag);
        }
        else
        {
            blockRenderer.material = emptyMaterial;
            labelText.text = string.Format("Line {0}\n[Empty]",
                cacheLineData.LineNumber);
        }
    }
}
```

---

## Phase 6: Create UI

### 6.1 Address Input UI

1. **Right-click Hierarchy → UI → Canvas**
2. **Canvas → Render Mode**: `Screen Space - Overlay`

3. **Add Input Field**:
   - **Right-click Canvas → UI → Input Field - TextMeshPro**
   - Name: `AddressInput`
   - Placeholder: `Enter address (0x...)`

4. **Add Button**:
   - **Right-click Canvas → UI → Button - TextMeshPro**
   - Name: `AccessButton`
   - Text: `Access Cache`

5. **Add Stats Label**:
   - **Right-click Canvas → UI → Text - TextMeshPro**
   - Name: `StatsText`
   - Position: Top right

---

## Phase 7: Connect Everything

### 7.1 Create Main Controller

Create `Assets/Scripts/ARCacheController.cs`:

```csharp
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using TMPro;
using CacheVisualizer.Core;

public class ARCacheController : MonoBehaviour
{
    [Header("Cache Configuration")]
    public int memorySizeKB = 16;
    public int cacheSizeKB = 1;
    public int blockSizeBytes = 16;
    
    [Header("Prefabs")]
    public GameObject cacheLinePrefab;
    
    [Header("UI")]
    public TMP_InputField addressInput;
    public TextMeshProUGUI statsText;
    
    private CacheConfiguration config;
    private AddressDecoder decoder;
    private DirectMappingController cache;
    private GameObject cacheContainer;
    
    void Start()
    {
        InitializeCache();
    }
    
    void InitializeCache()
    {
        config = new CacheConfiguration(
            memorySizeKB, cacheSizeKB, blockSizeBytes,
            MappingType.DirectMapped);
        
        decoder = new AddressDecoder(config);
        cache = new DirectMappingController(config);
        
        CreateCacheVisualization();
        UpdateStatsUI();
    }
    
    void CreateCacheVisualization()
    {
        cacheContainer = new GameObject("Cache");
        
        // Create visual cache lines in a grid
        int linesPerRow = 8;
        for (int i = 0; i < config.TotalCacheLines; i++)
        {
            int row = i / linesPerRow;
            int col = i % linesPerRow;
            
            Vector3 pos = new Vector3(col * 1.0f, 0, row * 0.4f);
            GameObject lineObj = Instantiate(cacheLinePrefab, pos,
                Quaternion.identity, cacheContainer.transform);
            
            var visual = lineObj.GetComponent<CacheLineVisual>();
            visual.SetCacheLineData(cache.GetCacheLine(i));
        }
    }
    
    public void OnAccessButtonClicked()
    {
        try
        {
            var addr = decoder.DecodeHex(addressInput.text);
            var result = cache.Access(addr);
            
            // Highlight accessed line
            HighlightCacheLine(result.CacheLineIndex, result.IsHit);
            
            UpdateStatsUI();
        }
        catch (System.Exception ex)
        {
            Debug.LogError("Invalid address: " + ex.Message);
        }
    }
    
    void HighlightCacheLine(int lineIndex, bool isHit)
    {
        var lineObj = cacheContainer.transform.GetChild(lineIndex);
        var visual = lineObj.GetComponent<CacheLineVisual>();
        
        if (isHit)
            visual.ShowHit();
        else
            visual.ShowMiss();
    }
    
    void UpdateStatsUI()
    {
        statsText.text = cache.GetStatistics();
    }
}
```

---

##  Phase 8: Build and Test

### 8.1 Test in Unity Editor

1. Click **Play** button
2. Test address input: `0x1A4B`
3. Verify cache visualization updates

### 8.2 Build for Android

1. **File → Build Settings**
2. Switch Platform to **Android**
3. **Add Open Scenes**
4. **Player Settings**:
   - Minimum API Level: **Android 7.0** (API 24)
   - Target API Level: Latest
   - Graphics API: **OpenGL ES3**
   - Enable **ARCore Supported**
   
5. Click **Build and Run**

---

## Troubleshooting

### Common Issues

**Q: Scripts don't compile in Unity**
- Check namespace matches
- Remove `nameof()` usage (Unity older C#)
- Wait for compilation to finish

**Q: AR not working on device**
- Enable ARCore/ARKit in Player Settings
- Check device supports AR
- Grant camera permissions

**Q: Cache lines not appearing**
- Check prefab is assigned
- Verify materials exist
- Check camera position

---

## Next Steps

1. Add animations for cache access
2. Implement set associative visualization
3. Add sound effects
4. Create tutorial mode
5. Add screenshot/recording feature

---

**Good luck with your Unity integration!** 🚀
