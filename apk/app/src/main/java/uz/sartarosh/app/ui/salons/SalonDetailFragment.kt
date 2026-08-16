package uz.sartarosh.app.ui.salons

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.navigation.fragment.navArgs
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.snackbar.Snackbar
import uz.sartarosh.app.R
import uz.sartarosh.app.databinding.FragmentSalonDetailBinding
import uz.sartarosh.app.ui.salons.adapters.ServiceListAdapter
import uz.sartarosh.app.ui.salons.adapters.StaffListAdapter

class SalonDetailFragment : Fragment() {

    private var _binding: FragmentSalonDetailBinding? = null
    private val binding get() = _binding!!

    private val args: SalonDetailFragmentArgs by navArgs()
    private val viewModel: SalonDetailViewModel by viewModels()

    private lateinit var serviceAdapter: ServiceListAdapter
    private lateinit var staffAdapter: StaffListAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentSalonDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.toolbar.setNavigationOnClickListener {
            findNavController().navigateUp()
        }

        staffAdapter = StaffListAdapter { staff ->
            viewModel.selectBarber(staff.barberId)
        }

        serviceAdapter = ServiceListAdapter { service ->
            val barberId = viewModel.resolveBarberIdForBooking()
            if (barberId.isNullOrBlank()) {
                Snackbar.make(
                    binding.root,
                    getString(R.string.no_barber_available),
                    Snackbar.LENGTH_SHORT,
                ).show()
                return@ServiceListAdapter
            }

            val action = SalonDetailFragmentDirections.actionSalonDetailToCreateBooking(
                salonId = args.salonId,
                serviceId = service.id,
                barberId = barberId,
            )
            findNavController().navigate(action)
        }

        binding.staffRecyclerView.layoutManager =
            LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        binding.staffRecyclerView.adapter = staffAdapter

        binding.servicesRecyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.servicesRecyclerView.adapter = serviceAdapter

        binding.salonCover.setImageResource(
            uz.sartarosh.app.ui.salons.adapters.SalonListAdapter.coverFor(args.salonId),
        )

        viewModel.state.observe(viewLifecycleOwner) { state ->
            val salon = state.salon ?: return@observe
            binding.salonName.text = salon.name
            binding.salonAddress.text = buildString {
                append(salon.address)
                salon.city?.let { append(", ").append(it) }
            }
            binding.salonRating.text = getString(
                R.string.salon_rating_reviews,
                salon.rating,
                salon.reviewCount,
            )

            salon.description?.takeIf { it.isNotBlank() }?.let {
                binding.salonDescription.text = it
                binding.salonDescription.isVisible = true
            } ?: run {
                binding.salonDescription.isVisible = false
            }

            staffAdapter.selectedBarberId = state.selectedBarberId
            staffAdapter.submitList(state.staff)
            binding.staffEmptyView.isVisible = state.staff.isEmpty()

            serviceAdapter.submitList(state.services)
            binding.servicesEmptyView.isVisible = state.services.isEmpty()
        }

        viewModel.loading.observe(viewLifecycleOwner) { loading ->
            binding.progressBar.isVisible = loading
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            binding.errorView.isVisible = !error.isNullOrBlank()
            binding.errorView.text = error
            if (!error.isNullOrBlank()) {
                Snackbar.make(binding.root, error, Snackbar.LENGTH_SHORT).show()
            }
        }

        if (viewModel.state.value?.salon == null) {
            viewModel.loadSalonDetail(args.salonId)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
