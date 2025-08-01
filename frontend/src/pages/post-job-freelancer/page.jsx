"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Navbar from "../../components/layout/Navbar"
import Footer from "../../components/layout/Footer"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { X, Plus, DollarSign, User, Upload, ImageIcon, ArrowLeft, Star, Loader2 } from "lucide-react"
import { freelancersAPI, portfolioAPI, uploadAPI, availabilityPostsAPI } from "../../services/api"
import { addItem } from "../../store/slices/apiSlice"

export default function PostJobFreelancer() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { isLoading, error } = useSelector((state) => state.api)
  
  const [serviceTitle, setServiceTitle] = useState("")
  const [serviceDescription, setServiceDescription] = useState("")
  const [category, setCategory] = useState("")
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [availability, setAvailability] = useState("")
  const [portfolioImages, setPortfolioImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [packages, setPackages] = useState([
    { name: "Basic", price: "", description: "", deliveryTime: "" },
    { name: "Standard", price: "", description: "", deliveryTime: "" },
    { name: "Premium", price: "", description: "", deliveryTime: "" },
  ])

  const categories = ["Digital Art", "Logo Design", "Graphic Design", "3D Design", "Character Design"]

  const suggestedSkills = [
    "Digital Art",
    "Logo Design",
    "Graphic Design",
    "3D Design",
    "Character Design",
    "Adobe Photoshop",
    "Adobe Illustrator",
    "Figma",
    "Blender",
    "Maya",
    "Procreate",
    "Sketch",
  ]

  const addSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill])
    }
    setNewSkill("")
  }

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    
    // Upload images to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', 'artlink/portfolios')
      
      try {
        const response = await uploadAPI.uploadPortfolio(formData)
        return {
          id: response.data.public_id,
          name: file.name,
          url: response.data.secure_url,
          public_id: response.data.public_id
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        return null
      }
    })
    
    const uploadedImages = await Promise.all(uploadPromises)
    const successfulUploads = uploadedImages.filter(img => img !== null)
    setPortfolioImages([...portfolioImages, ...successfulUploads])
  }

  const removeImage = (imageId) => {
    setPortfolioImages(portfolioImages.filter((img) => img.id !== imageId))
  }

  const updatePackage = (index, field, value) => {
    const updatedPackages = [...packages]
    updatedPackages[index][field] = value
    setPackages(updatedPackages)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError("")

    try {
      console.log('=== FORM SUBMISSION STARTED ===')
      console.log('Full user object:', user)
      
      // Check if user is logged in
      if (!user) {
        console.log('❌ No user found')
        setSubmitError("Please log in to create a service")
        return
      }

      console.log('✅ User is logged in:', user.email)

      // Get user ID - the backend returns userId field
      const userId = user.userId
      console.log('User ID extracted:', userId)
      
      if (!userId) {
        console.log('❌ No user ID found')
        setSubmitError("User ID not found. Please log in again.")
        return
      }

      console.log('✅ User ID valid:', userId)

      // Validate required fields
      console.log('Validating required fields...')
      console.log('- serviceTitle:', serviceTitle)
      console.log('- serviceDescription:', serviceDescription) 
      console.log('- category:', category)
      console.log('- hourlyRate:', hourlyRate)
      
      if (!serviceTitle || !serviceDescription || !category || !hourlyRate) {
        console.log('❌ Required fields missing')
        setSubmitError("Please fill in all required fields: Service Title, Description, Category, and Hourly Rate")
        return
      }

      // Validate field lengths and formats
      if (serviceTitle.length < 5) {
        setSubmitError("Service title must be at least 5 characters long")
        return
      }

      if (serviceDescription.length < 20) {
        setSubmitError("Service description must be at least 20 characters long")
        return
      }

      console.log('✅ All required fields present and valid')
      
      // Create availability post FIRST (this is what shows up in browse-freelancers)
      console.log('=== CREATING AVAILABILITY POST ===')
      
      // Map frontend categories to backend categories
      const categoryMap = {
        "Digital Art": "illustration",
        "Logo Design": "design", 
        "Graphic Design": "design",
        "3D Design": "animation",
        "Character Design": "illustration"
      }
      
      // Map frontend availability to backend availabilityType
      const availabilityTypeMap = {
        "full-time": "immediate",
        "part-time": "within-week", 
        "project-based": "flexible",
        "weekends": "flexible"
      }
      
      const backendCategory = categoryMap[category] || "other"
      const backendAvailabilityType = availabilityTypeMap[availability] || "flexible"
      
      console.log('Mapped category:', category, '→', backendCategory)
      console.log('Mapped availability:', availability, '→', backendAvailabilityType)
      
      const availabilityPostData = {
        title: serviceTitle,
        description: serviceDescription,
        category: backendCategory,
        availabilityType: backendAvailabilityType,
        duration: 'Flexible',
        budget: parseFloat(hourlyRate) || 0,
        location: 'Remote',
        skills: skills.length > 0 ? skills.join(', ') : 'Creative Services',
        portfolioSamples: portfolioImages.map(img => img.url),
        contactPreference: 'platform',
        status: 'active'
      }

      console.log('Availability post data:', availabilityPostData)

      let availabilityPost
      try {
        console.log('Sending availability post to backend...')
        const availabilityResponse = await availabilityPostsAPI.create(availabilityPostData)
        console.log('✅ Availability post created successfully:', availabilityResponse.data)
        availabilityPost = availabilityResponse.data
      } catch (availabilityError) {
        console.error('❌ Error creating availability post:', availabilityError)
        console.log('Error details:', availabilityError.response?.data)
        throw availabilityError // Stop here if availability post fails
      }

      console.log('=== CREATING FREELANCER PROFILE ===')
      // Create or update freelancer profile
      const freelancerData = {
        userId: parseInt(userId),
        name: user.name || user.email || `User ${userId}`,
        title: serviceTitle,
        description: serviceDescription,
        hourlyRate: parseFloat(hourlyRate) || 0,
        skills: skills.join(', '),
        availability: availability,
        category: category
      }

      console.log('Freelancer data:', freelancerData)

      let freelancerProfile
      try {
        console.log('Creating freelancer profile...')
        const response = await freelancersAPI.create(freelancerData)
        console.log('✅ Freelancer profile created:', response.data)
        freelancerProfile = response.data
      } catch (error) {
        console.log('Freelancer creation failed, checking if exists...')
        if (error.response?.status === 400 || error.response?.status === 409) {
          try {
            const existingResponse = await freelancersAPI.getByUserId(userId)
            freelancerProfile = existingResponse.data
            console.log('✅ Found existing freelancer profile:', freelancerProfile)
          } catch (getError) {
            console.error('❌ Error getting existing freelancer:', getError)
            // Don't fail the whole process just for this
            console.log('⚠️ Continuing without freelancer profile update')
          }
        } else {
          console.error('❌ Unexpected freelancer creation error:', error)
          // Don't fail the whole process just for this
          console.log('⚠️ Continuing without freelancer profile')
        }
      }

      // Create portfolio entries (optional)
      if (portfolioImages.length > 0 && freelancerProfile) {
        console.log('=== CREATING PORTFOLIO ITEMS ===')
        try {
          const portfolioPromises = portfolioImages.map(async (image) => {
            const portfolioData = {
              freelancerId: freelancerProfile.freelancerId || freelancerProfile.id,
              title: `${serviceTitle} - Portfolio Item`,
              description: serviceDescription,
              imageUrl: image.url,
              tags: skills.join(',')
            }
            
            try {
              const response = await portfolioAPI.create(portfolioData)
              return response.data
            } catch (error) {
              console.error('Error creating portfolio item:', error)
              return null
            }
          })
          
          await Promise.all(portfolioPromises)
          console.log('✅ Portfolio items created')
        } catch (portfolioError) {
          console.error('❌ Portfolio creation failed:', portfolioError)
          // Don't fail the whole process for portfolio errors
        }
      }

      console.log('=== SUCCESS! ===')
      console.log('✅ Service created successfully!')
      
      // Navigate to browse-freelancers to see the new service
      navigate('/browse-freelancers')
    } catch (error) {
      console.error('=== FORM SUBMISSION FAILED ===')
      console.error('Error:', error)
      console.log('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      setSubmitError(error.response?.data?.error || error.message || 'Failed to create service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#202020] to-[#000000]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/home" className="inline-flex items-center text-gray-300 hover:text-[#A95BAB] transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#A95BAB] bg-clip-text text-transparent mb-4">
            Create Your Service
          </h1>
          <p className="text-lg text-gray-300">Showcase your creative skills and attract clients</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Display */}
          {submitError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400">{submitError}</p>
            </div>
          )}

          {/* Loading Display */}
          {loading && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400 mr-2" />
                <p className="text-blue-400">Creating your freelancer profile...</p>
              </div>
            </div>
          )}

          {/* Service Details */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <User className="h-5 w-5 mr-2" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="service-title" className="text-white">
                  Service Title *
                </Label>
                <Input
                  id="service-title"
                  placeholder="e.g. I will create a stunning logo design for your brand"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
                <p className="text-sm text-gray-400 mt-1">Start with "I will..." to describe what you offer</p>
              </div>

              <div>
                <Label htmlFor="category" className="text-white">
                  Category *
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select your specialty" className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white"
                      >
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {category && (
                  <p className="text-sm text-green-400 mt-1">Selected: {category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="service-description" className="text-white">
                  Service Description *
                </Label>
                <Textarea
                  id="service-description"
                  placeholder="Describe your service in detail. What makes you unique? What can clients expect from working with you?"
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  className="mt-1 min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
                <p className="text-sm text-gray-400 mt-1">Highlight your experience and what sets you apart</p>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Images */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <ImageIcon className="h-5 w-5 mr-2" />
                Portfolio Gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Upload Your Best Work *</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#A95BAB]/30 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-[#A95BAB]/10 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                <p className="text-sm text-gray-400 mt-1">Upload 3-10 images showcasing your best work and style</p>
              </div>

              {portfolioImages.length > 0 && (
                <div>
                  <Label className="text-white">Portfolio Images ({portfolioImages.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {portfolioImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.name}
                          className="w-full h-24 object-cover rounded-lg border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-gray-400 mt-1 truncate">{image.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills & Expertise */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Add Your Skills</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Type a skill and press Enter"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addSkill(newSkill)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addSkill(newSkill)}
                    disabled={!newSkill}
                    className="bg-[#A95BAB] hover:bg-[#A95BAB]/80"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {skills.length > 0 && (
                <div>
                  <Label className="text-white">Your Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="flex items-center gap-1 bg-[#A95BAB]/20 text-white border-[#A95BAB]/30"
                      >
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-red-400">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-white">Popular Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestedSkills
                    .filter((skill) => !skills.includes(skill))
                    .slice(0, 10)
                    .map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="cursor-pointer hover:bg-[#A95BAB]/20 border-white/20 text-gray-300 hover:border-[#A95BAB]/50"
                        onClick={() => addSkill(skill)}
                      >
                        + {skill}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Availability */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing & Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="hourly-rate" className="text-white">
                  Hourly Rate *
                </Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="hourly-rate"
                    type="number"
                    placeholder="25"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <p className="text-sm text-gray-400 mt-1">Set your hourly rate in USD</p>
              </div>

              <div>
                <Label htmlFor="availability" className="text-white">
                  Availability
                </Label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select your availability" className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem
                      value="full-time"
                      className="text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white"
                    >
                      Full-time (40+ hours/week)
                    </SelectItem>
                    <SelectItem
                      value="part-time"
                      className="text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white"
                    >
                      Part-time (20-40 hours/week)
                    </SelectItem>
                    <SelectItem
                      value="project-based"
                      className="text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white"
                    >
                      Project-based
                    </SelectItem>
                    <SelectItem
                      value="weekends"
                      className="text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white"
                    >
                      Weekends only
                    </SelectItem>
                  </SelectContent>
                </Select>
                {availability && (
                  <p className="text-sm text-green-400 mt-1">Selected: {availability}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Packages */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Service Packages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-300">Create different packages to offer clients various options</p>

              <div className="grid md:grid-cols-3 gap-6">
                {packages.map((pkg, index) => (
                  <Card key={index} className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center">
                        {pkg.name === "Basic" && <Star className="h-4 w-4 mr-2 text-gray-400" />}
                        {pkg.name === "Standard" && <Star className="h-4 w-4 mr-2 text-yellow-400" />}
                        {pkg.name === "Premium" && <Star className="h-4 w-4 mr-2 text-[#A95BAB]" />}
                        {pkg.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-white">Price *</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="number"
                            placeholder="50"
                            value={pkg.price}
                            onChange={(e) => updatePackage(index, "price", e.target.value)}
                            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Description</Label>
                        <Textarea
                          placeholder="What's included in this package?"
                          value={pkg.description}
                          onChange={(e) => updatePackage(index, "description", e.target.value)}
                          className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label className="text-white">Delivery Time</Label>
                        <Select
                          value={pkg.deliveryTime}
                          onValueChange={(value) => updatePackage(index, "deliveryTime", value)}
                        >
                          <SelectTrigger className="mt-1 bg-[#202020] border-[#A95BAB]/30 text-white">
                            <SelectValue placeholder="Select delivery time" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#202020] border-[#A95BAB]/30">
                            <SelectItem
                              value="1-day"
                              className="text-white hover:bg-[#A95BAB]/20 focus:bg-[#A95BAB]/20 focus:text-white"
                            >
                              1 day
                            </SelectItem>
                            <SelectItem
                              value="3-days"
                              className="text-white hover:bg-[#A95BAB]/20 focus:bg-[#A95BAB]/20 focus:text-white"
                            >
                              3 days
                            </SelectItem>
                            <SelectItem
                              value="1-week"
                              className="text-white hover:bg-[#A95BAB]/20 focus:bg-[#A95BAB]/20 focus:text-white"
                            >
                              1 week
                            </SelectItem>
                            <SelectItem
                              value="2-weeks"
                              className="text-white hover:bg-[#A95BAB]/20 focus:bg-[#A95BAB]/20 focus:text-white"
                            >
                              2 weeks
                            </SelectItem>
                            <SelectItem
                              value="1-month"
                              className="text-white hover:bg-[#A95BAB]/20 focus:bg-[#A95BAB]/20 focus:text-white"
                            >
                              1 month
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              className="border-[#A95BAB]/30 text-white hover:bg-[#A95BAB]/20 hover:border-[#A95BAB] bg-[#202020]"
            >
              Save as Draft
            </Button>
            <div className="space-x-4">
              <Button
                type="button"
                variant="outline"
                className="border-[#A95BAB]/30 text-white hover:bg-[#A95BAB]/20 hover:border-[#A95BAB] bg-[#202020]"
                disabled={loading}
              >
                Preview Service
              </Button>
              <Button 
                type="submit" 
                size="lg" 
                className="bg-[#A95BAB] hover:bg-[#A95BAB]/80 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Profile...
                  </>
                ) : (
                  'Publish Service'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}
