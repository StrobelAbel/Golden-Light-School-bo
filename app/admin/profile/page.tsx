"use client"

import {CldUploadWidget} from "next-cloudinary"
import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Mail, 
  Phone,
  MapPin,
  Edit,
  Camera,
  Save, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Calendar,
  Building,
  Globe,
  X
} from "lucide-react"
import Image from "next/image"
import { useTranslation } from "@/hooks/useTranslation"

interface UserProfile {
  _id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  bio?: string
  location?: string
  department?: string
  position?: string
  website?: string
  avatar?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  role: string
  createdAt: string
  updatedAt: string
}

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfileSettingsPage() {
  const { t } = useTranslation()
  // Profile data state
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    location: "",
    department: "",
    position: "",
    website: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      github: ""
    }
  })
  
  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  // Avatar state
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  
  const router = useRouter()

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch("/api/admin/profile", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("adminToken")
          localStorage.removeItem("adminUser")
          router.push("/admin/login")
          return
        }
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }

      const data = await response.json()
      setProfile(data)
      setFormData({
        username: data.username || "",
        email: data.email || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        bio: data.bio || "",
        location: data.location || "",
        department: data.department || "",
        position: data.position || "",
        website: data.website || "",
        socialLinks: {
          linkedin: data.socialLinks?.linkedin || "",
          twitter: data.socialLinks?.twitter || "",
          github: data.socialLinks?.github || ""
        }
      })
      
      // Update localStorage with fresh data
      localStorage.setItem("adminUser", JSON.stringify(data))
      
    } catch (err: any) {
      console.error("Error fetching profile:", err)
      setError(err.message || "Error loading profile")
    } finally {
      setLoading(false)
    }
  }, [router])

  // Load profile on mount
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Clear messages after timeout
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])



  // Update avatar URL from Cloudinary
  const updateAvatarUrl = async (avatarUrl: string) => {
    console.log("Updating avatar URL:", avatarUrl)
    setUploadingAvatar(true)
    try {
      // Immediately update UI
      setProfile(prev => {
        const updated = prev ? { ...prev, avatar: avatarUrl } : null
        console.log("Updated profile state:", updated)
        return updated
      })
      
      const token = localStorage.getItem("adminToken")
      const updateData = { ...formData, avatar: avatarUrl }
      console.log("Sending update data:", updateData)
      
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API Error:", errorData)
        throw new Error(errorData.error || "Failed to update avatar")
      }

      const updatedProfile = await response.json()
      console.log("API Response:", updatedProfile)
      setProfile(updatedProfile)
      localStorage.setItem("adminUser", JSON.stringify(updatedProfile))
      setSuccess("Avatar updated successfully!")
      
    } catch (err: any) {
      console.error("Avatar update error:", err)
      setError(err.message || "Error updating avatar")
      // Revert UI on error
      await fetchProfile()
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        router.push("/admin/login")
        return
      }

      // Basic validation
      if (!formData.username.trim() || !formData.email.trim()) {
        throw new Error("Username and email are required")
      }

      if (!formData.email.includes("@")) {
        throw new Error("Please enter a valid email address")
      }

      // Validate URLs if provided
      const urlFields = ['website', 'socialLinks.linkedin', 'socialLinks.twitter', 'socialLinks.github']
      for (const field of urlFields) {
        const value = field.includes('.') 
          ? formData.socialLinks[field.split('.')[1] as keyof typeof formData.socialLinks]
          : formData[field as keyof typeof formData]
        
        if (value && typeof value === 'string' && value.trim()) {
          try {
            new URL(value.startsWith('http') ? value : `https://${value}`)
          } catch {
            throw new Error(`Please enter a valid URL for ${field.replace('socialLinks.', '').replace('_', ' ')}`)
          }
        }
      }

      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update profile: ${response.status}`)
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      
      // Update localStorage
      localStorage.setItem("adminUser", JSON.stringify(updatedProfile))
      
      setSuccess("Profile updated successfully!")
      
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Error updating profile")
    } finally {
      setSaving(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)
    setError("")
    setSuccess("")

    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("All password fields are required")
      }

      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match")
      }

      if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters long")
      }

      const token = localStorage.getItem("adminToken")
      
      if (!token) {
        router.push("/admin/login")
        return
      }

      const response = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to change password: ${response.status}`)
      }

      // Clear password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

      setSuccess("Password changed successfully!")
      
    } catch (err: any) {
      console.error("Error changing password:", err)
      setError(err.message || "Error changing password")
    } finally {
      setChangingPassword(false)
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return "Unknown"
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-golden-600" />
          <p className="text-gray-600">{t('Loading profile...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('Profile Settings')}</h1>
        <p className="text-gray-600">{t('Update your personal information and avatar')}</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Camera className="mr-2 h-4 w-4" />
                {t('Profile Picture')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="relative mx-auto w-32 h-32">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-golden-500 to-golden-600 flex items-center justify-center">
                  {profile?.avatar ? (
                    <Image
                      src={`${profile.avatar}?${Date.now()}`}
                      alt="Profile"
                      fill
                      className="object-cover"
                      key={profile.avatar}
                    />
                  ) : (
                    <User className="h-16 w-16 text-white" />
                  )}
                </div>
                <CldUploadWidget
                  uploadPreset="golden-light-avatars"
                  options={{
                    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                    maxFiles: 1,
                    resourceType: "image",
                    clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                    maxFileSize: 5000000,
                    cropping: true,
                    croppingAspectRatio: 1,
                    folder: "golden-light-avatars"
                  }}
                  onSuccess={(result: any) => {
                    if (result.event === "success") {
                      updateAvatarUrl(result.info.secure_url)
                    }
                  }}
                >
                  {({ open }) => (
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full p-2 h-8 w-8"
                      onClick={() => open()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Edit className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </CldUploadWidget>
              </div>

              <div className="text-xs text-gray-500">
                <p>{t('JPG, PNG, WebP up to 5MB')}</p>
                <p>{t('Auto-cropped to 400x400px')}</p>
                <p>{t('Click edit button to upload')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t('Personal Information')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username" className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{t('Username')} *</span>
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      required
                      disabled={saving}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{t('Email')} *</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      disabled={saving}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t('First Name')}</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={saving}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('Last Name')}</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={saving}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{t('Phone')}</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={saving}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{t('Location')}</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={saving}
                      className="mt-1"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">{t('Bio')}</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={saving}
                    className="mt-1"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>{t('Professional Information')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">{t('Department')}</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    disabled={saving}
                    className="mt-1"
                    placeholder="e.g. IT, Administration"
                  />
                </div>
                <div>
                  <Label htmlFor="position">{t('Position')}</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    disabled={saving}
                    className="mt-1"
                    placeholder="e.g. System Administrator"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links & Social */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>{t('Links & Social Media')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="website">{t('Website')}</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    disabled={saving}
                    className="mt-1"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="linkedin">{t('LinkedIn')}</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                      }))}
                      disabled={saving}
                      className="mt-1"
                      placeholder="LinkedIn profile URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">{t('Twitter')}</Label>
                    <Input
                      id="twitter"
                      type="url"
                      value={formData.socialLinks.twitter}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                      }))}
                      disabled={saving}
                      className="mt-1"
                      placeholder="Twitter profile URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github">{t('GitHub')}</Label>
                    <Input
                      id="github"
                      type="url"
                      value={formData.socialLinks.github}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, github: e.target.value }
                      }))}
                      disabled={saving}
                      className="mt-1"
                      placeholder="GitHub profile URL"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>{t('Change Password')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">{t('Current Password')}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                      disabled={changingPassword}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newPassword">{t('New Password')}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                        disabled={changingPassword}
                        className="pr-10"
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">{t('Confirm New Password')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        disabled={changingPassword}
                        className="pr-10"
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="bg-red-600 hover:bg-red-700" 
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('Changing Password...')}
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      {t('Change Password')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Save Profile Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              onClick={() => fetchProfile()}
              variant="outline"
              disabled={saving}
            >
              {t('Reset Changes')}
            </Button>
            <Button 
              onClick={(e) => handleProfileUpdate(e)}
              className="bg-golden-600 hover:bg-golden-700" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('Saving Profile...')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('Save Profile')}
                </>
              )}
            </Button>
          </div>

          {/* Profile Stats */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t('Profile Information')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('Member Since')}:</span>
                    <span className="font-medium">{formatDate(profile.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('Last Updated')}:</span>
                    <span className="font-medium">{formatDate(profile.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('Profile ID')}:</span>
                    <span className="font-mono text-xs">{profile._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('Role')}:</span>
                    <Badge variant="outline" className="bg-golden-50 border-golden-200 text-golden-700">
                      {profile.role?.replace("_", " ").toUpperCase() || "ADMIN"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
