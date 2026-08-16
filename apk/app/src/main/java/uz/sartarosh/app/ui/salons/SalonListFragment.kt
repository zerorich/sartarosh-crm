package uz.sartarosh.app.ui.salons

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.snackbar.Snackbar
import uz.sartarosh.app.databinding.FragmentSalonListBinding
import uz.sartarosh.app.ui.salons.adapters.SalonListAdapter

class SalonListFragment : Fragment() {

    private var _binding: FragmentSalonListBinding? = null
    private val binding get() = _binding!!

    private val viewModel: SalonListViewModel by viewModels()
    private lateinit var adapter: SalonListAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = FragmentSalonListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        adapter = SalonListAdapter { salon ->
            val action = SalonListFragmentDirections.actionSalonListToSalonDetail(salon.id)
            findNavController().navigate(action)
        }

        binding.salonRecyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.salonRecyclerView.adapter = adapter

        binding.swipeRefresh.setOnRefreshListener {
            viewModel.loadSalons(refresh = true)
        }

        viewModel.salons.observe(viewLifecycleOwner) { salons ->
            adapter.submitList(salons)
            binding.emptyView.isVisible = salons.isEmpty()
        }

        viewModel.loading.observe(viewLifecycleOwner) { loading ->
            val showInitialLoader = loading && adapter.itemCount == 0
            binding.progressBar.isVisible = showInitialLoader
            binding.swipeRefresh.isRefreshing = loading && adapter.itemCount > 0
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            binding.errorView.isVisible = !error.isNullOrBlank()
            binding.errorView.text = error
            if (!error.isNullOrBlank()) {
                Snackbar.make(binding.root, error, Snackbar.LENGTH_SHORT).show()
            }
        }

        if (viewModel.salons.value.isNullOrEmpty()) {
            viewModel.loadSalons()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
