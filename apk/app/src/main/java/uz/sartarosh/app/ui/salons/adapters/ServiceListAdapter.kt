package uz.sartarosh.app.ui.salons.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import uz.sartarosh.app.data.model.ServiceDto
import uz.sartarosh.app.databinding.ItemServiceBinding
import uz.sartarosh.app.util.MoneyFormatter

class ServiceListAdapter(
    private val onBookClick: (ServiceDto) -> Unit,
) : ListAdapter<ServiceDto, ServiceListAdapter.ServiceViewHolder>(DiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ServiceViewHolder {
        val binding = ItemServiceBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false,
        )
        return ServiceViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ServiceViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ServiceViewHolder(
        private val binding: ItemServiceBinding,
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(service: ServiceDto) {
            binding.serviceName.text = service.name
            binding.serviceDuration.text = "${service.durationMinutes} min"
            binding.servicePrice.text = MoneyFormatter.formatUzs(service.price)
            service.description?.takeIf { it.isNotBlank() }?.let {
                binding.serviceDescription.text = it
                binding.serviceDescription.visibility = android.view.View.VISIBLE
            } ?: run {
                binding.serviceDescription.visibility = android.view.View.GONE
            }
            binding.bookButton.setOnClickListener { onBookClick(service) }
        }
    }

    private object DiffCallback : DiffUtil.ItemCallback<ServiceDto>() {
        override fun areItemsTheSame(oldItem: ServiceDto, newItem: ServiceDto): Boolean =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: ServiceDto, newItem: ServiceDto): Boolean =
            oldItem == newItem
    }
}
