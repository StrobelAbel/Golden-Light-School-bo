import mongoose from "mongoose"

export interface ILanguage extends mongoose.Document {
  code: string
  name: string
  nativeName: string
  flag: string
  isActive: boolean
  isDefault: boolean
  translations: Record<string, string>
  createdAt: Date
  updatedAt: Date
}

const LanguageSchema = new mongoose.Schema<ILanguage>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    nativeName: {
      type: String,
      required: true,
    },
    flag: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    translations: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

// Ensure only one default language
LanguageSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await mongoose.model("Language").updateMany({ _id: { $ne: this._id } }, { isDefault: false })
  }
  next()
})

export default mongoose.models.Language || mongoose.model<ILanguage>("Language", LanguageSchema)
