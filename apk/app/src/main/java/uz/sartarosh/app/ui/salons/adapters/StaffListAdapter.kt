package uz.sartarosh.app.ui.salons.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.color.MaterialColors
import uz.sartarosh.app.R
import uz.sartarosh.app.data.model.StaffMemberDto
import uz.sartarosh.app.data.model.displayName
import uz.sartarosh.app.databinding.ItemStaffBinding
import java.util.Locale
import kotlin.math.abs

class StaffListAdapter(
    private val onStaffClick: (StaffMemberDto) -> Unit,
) : ListAdapter<StaffMemberDto, StaffListAdapter.StaffViewHolder>(DiffCallback) {

    companion object {
        private val AVATARS = intArrayOf(
            R.drawable.img_barber_avatar_1,
            R.drawable.img_barber_avatar_2,
            R.drawable.img_barber_avatar_3,
            R.drawable.img_barber_avatar_4,
        )

        fun avatarFor(id: String): Int = AVATARS[abs(id.hashCode()) % AVATARS.size]
    }

    var selectedBarberId: String? = null
        set(value) {
            field = value
            notifyDataSetChanged()
        }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StaffViewHolder {
        val binding = ItemStaffBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false,
        )
        return StaffViewHolder(binding)
    }

    override fun onBindViewHolder(holder: StaffViewHolder, position: Int) {
        holder.bind(getItem(position), getItem(position).barberId == selectedBarberId)
    }

    inner class StaffViewHolder(
        private val binding: ItemStaffBinding,
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(staff: StaffMemberDto, selected: Boolean) {
            binding.staffAvatar.setImageResource(avatarFor(staff.barberId))
            binding.staffName.text = staff.barber.user.displayName()
            binding.staffRating.text = String.format(
                Locale.getDefault(),
                "%.1f",
                staff.barber.rating,
            )
            staff.barber.bio?.takeIf { it.isNotBlank() }?.let {
                binding.staffBio.text = it
                binding.staffBio.visibility = android.view.View.VISIBLE
            } ?: run {
                binding.staffBio.visibility = android.view.View.GONE
            }

            val strokeColor = if (selected) {
                MaterialColors.getColor(binding.root, com.google.android.material.R.attr.colorPrimary)
            } else {
                ContextCompat.getColor(binding.root.context, R.color.outline)
            }
            binding.staffCard.strokeColor = strokeColor
            binding.staffCard.strokeWidth = if (selected) 4 else 1

            binding.root.setOnClickListener { onStaffClick(staff) }
        }
    }

    private object DiffCallback : DiffUtil.ItemCallback<StaffMemberDto>() {
        override fun areItemsTheSame(oldItem: StaffMemberDto, newItem: StaffMemberDto): Boolean =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: StaffMemberDto, newItem: StaffMemberDto): Boolean =
            oldItem == newItem
    }
}
